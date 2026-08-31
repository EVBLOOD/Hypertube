import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "./entities/movie.entity";
import axios from "axios";
import { FilterMovieDto } from "./dto/filter-movie.dto";
import { UserMovieProgress } from "./entities/user-movie-progress.entity";
import { RedisService } from "src/common/redis/redis.service";
import { PaginationMovieDto } from "./dto/pagination-movie.dto ";
import { UserMovieHistory } from "./entities/user-movie-history.entity";
import { v4 as uuidv4 } from "uuid";
import { MailsService } from "src/mails/mails.service";
import { User } from "src/users/entities/user.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { MovieGateway } from "./movies.gateway";
import path from "path";
import { existsSync } from "fs";
import fsPromises from "node:fs/promises";
import AdmZip from "adm-zip";
import type { DefaultLanguage } from "src/common/decorators/language.decorator";

export interface MovieInfos {
    id: string;
    title: string;
    year: number;
    rating: number;
    genres: string[];
    quality: string;
    standard_audio_format: string;
    poster: string;
    isWatched: boolean;
    overview?: string;
    size?: number;
    time?: number;
}

export interface MoviesHistory extends MovieInfos {
    action: string;
    actionDate: Date;
}

export interface MovieLibrary {
    movies: MovieInfos;
    metadata: {
        nextPage: number;
        hasMore: boolean;
    };
}

export const YTS_TRACKERS = [
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://open.demonii.com:1337/announce",
    "udp://exodus.desync.com:6969/announce",
];

export interface YtsTorrent {
    magnet: string;
    seeds: number;
    peers: number;
    quality: string;
    size: string;
}

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie) private movieRepo: Repository<Movie>,
        @InjectRepository(UserMovieHistory)
        private historyRepo: Repository<UserMovieHistory>,
        @InjectRepository(UserMovieProgress)
        private progressRepo: Repository<UserMovieProgress>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Comment)
        private commentRepo: Repository<Comment>,
        private redisservice: RedisService,
        private readonly emailsService: MailsService,
        @Inject(forwardRef(() => MovieGateway))
        private readonly movieGateway: MovieGateway,
    ) { }

    LANGS = {
        en: "en-US",
        fr: "fr-FR",
        ar: "ar-SA",
    };

    TMDB_GENRE_MAP = {
        action: 28,
        adventure: 12,
        animation: 16,
        biography: 27,
        comedy: 35,
        crime: 80,
        documentary: 99,
        drama: 18,
        family: 10751,
        fantasy: 14,
        "film-noir": 17,
        history: 36,
        horror: 27,
        music: 10402,
        musical: 10749,
        mystery: 9648,
        romance: 10749,
        "sci-fi": 878,
        sport: 10770,
        thriller: 53,
        war: 10752,
        western: 37,
    };

    normalizeMovie(movie: any): MovieInfos {
        return {
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
            rating: movie.vote_average,
            genres: movie.genres,
            quality: "N/A",
            standard_audio_format: "N/A",
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            isWatched: false,
        };
    }

    private async imdbIdFromTMDB(
        movie: MovieInfos,
        lang: DefaultLanguage,
    ): Promise<MovieInfos> {
        const cache = await this.redisservice.get(`metadata:${movie.id}`);
        if (cache) return JSON.parse(cache);

        try {
            const { data } = await axios.get(
                `${process.env.TMDB_API}movie/${movie.id}?api_key=${process.env.TMDB_KEY}&append_to_response=external_ids&language=${this.LANGS[lang || "en"] || "en-US"}`,
            );
            movie.id = data.imdb_id;
            movie.genres = data.genres.map(
                (g: { id: number; name: string }) => g.name,
            );

            await this.redisservice.set(
                `metadata:${movie.id}`,
                JSON.stringify(movie),
                600000,
            );
        } catch (err) {
            console.error(err);
        }
        return movie;
    }

    private getQualityScore(q: string) {
        return q === "2160p" ? 3 : q === "1080p" ? 2 : 1;
    }

    async getMovieYTS(
        movie: MovieInfos,
        moreinfos = false,
    ): Promise<MovieInfos> {
        try {
            const { data } = await axios.get(
                `${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`,
                {
                    params: {
                        query_term: movie.id,
                    },
                },
            );
            const ytsMovie = data.data.movies?.[0];
            if (ytsMovie) {
                const best = ytsMovie.torrents.reduce((prev, curr) =>
                    this.getQualityScore(curr.quality) >
                        this.getQualityScore(prev.quality)
                        ? curr
                        : prev,
                );
                movie.standard_audio_format =
                    best.audio_channels === "5.1" ? "5.1 SURROUND" : "STEREO";
                movie.quality = best.quality;
                if (moreinfos) {
                    movie.size = best.size;
                    movie.time = ytsMovie.runtime;
                }
            }
        } catch (err) {
            console.error(err);
        }
        return movie;
    }

    async getLibrary(
        filters: FilterMovieDto,
        userId: number,
        lang: DefaultLanguage,
    ) {
        const {
            query,
            genre,
            minRating,
            maxYear,
            minYear,
            page = 1,
            limit = 20,
            sortBy,
            order = "asc",
        } = filters;

        if (lang === "df") {
            const user = await this.userRepo.findOne({ where: { id: userId } });
            lang = user?.preferredLanguage || "en";
        }

        const cacheKey = `search:${userId}:${query || "all"}:${genre || "all"}:${minRating || "0"}:${minYear || "1900"}:${maxYear || "2100"}:${sortBy || "popularity"}:${order || "asc"}:${lang}`;
        const pageTrackerKey = `${cacheKey}:next_tmdb_page${lang}`;
        const LimitTrackerKey = `${cacheKey}:keep_tmdb_limit${lang}`;

        const activeFilters: FilterMovieDto = { ...filters };
        if (!query || query.trim() === "") {
            delete activeFilters.query;
        }

        const needed = page * limit;
        const cachedCount = await this.redisservice.lenZSet(cacheKey);

        if (cachedCount <= needed) {
            const currentTmdbPage =
                Number(await this.redisservice.get(pageTrackerKey)) || page;
            const currentTmdbLimit =
                Number(await this.redisservice.get(LimitTrackerKey)) || limit;
            console.log(`Fetching from TMDB: page ${currentTmdbPage}, 
                limit ${currentTmdbLimit}`);

            const tmdbFilters = {
                ...activeFilters,
                page: currentTmdbPage,
                limit: currentTmdbLimit,
                language: lang,
            };
            const { movies, page: nextTmdbPage } =
                await this.fetchFromTMDB(tmdbFilters);
            console.log(
                `Fetched ${movies.length} movies from TMDB for filters:`,
                tmdbFilters,
            );

            const ytsMovies = (
                await Promise.all(
                    movies.map(async (movie) => await this.getMovieYTS(movie)),
                )
            ).filter(Boolean);

            if (ytsMovies.length > 0) {
                await this.redisservice.pushMovies(cacheKey, ytsMovies);
            }
            await this.redisservice.set(
                pageTrackerKey,
                nextTmdbPage.toString(),
                86400,
            );
            await this.redisservice.set(
                LimitTrackerKey,
                currentTmdbLimit.toString(),
                86400,
            );
        }

        const start = (page - 1) * limit;
        const cachedMovies = await this.redisservice.getMovies(
            cacheKey,
            start,
            limit,
        );
        let processedMovies: any[] = await Promise.all(
            cachedMovies.map((m) => this.dataUserIMDB(m, userId)),
        );

        if (userId && processedMovies.length > 0) {
            const moviesWithUserData = await Promise.all(
                processedMovies.map((m: MovieInfos) =>
                    this.extractUserMovieDetails(m.id, userId),
                ),
            );
            processedMovies = processedMovies.map(
                (movie: MovieInfos, index) => ({
                    ...movie,
                    ...moviesWithUserData[index],
                }),
            );
        }
        const total = await this.redisservice.lenZSet(cacheKey);

        return {
            data: processedMovies,
            metadata: {
                nextPage: page + 1,
                hasMore: total > page * limit,
            },
        };
    }

    private async fetchTrendingFromTMDB(
        paging: PaginationMovieDto,
    ): Promise<MovieInfos[]> {
        let results: MovieInfos[] = [];

        const pagesToFetch = Math.ceil(((paging.limit || 20) + 1) / 20);

        try {
            const endpoint = "trending/movie/day";
            const params: any = {
                api_key: process.env.TMDB_KEY,
                page: paging.page || 1,
                language: this.LANGS[paging.language || "en"] || "en-US",
            };

            const requests: any = [];
            for (let i = 0; i < pagesToFetch; i++) {
                requests.push(
                    axios.get(`${process.env.TMDB_API}${endpoint}`, {
                        params: { ...params, page: params.page + i },
                    }),
                );
            }
            const responses = await Promise.all(requests);
            const data = responses.flatMap((res) => res.data.results || []);
            results = (data || [])?.map((m: any) => this.normalizeMovie(m));
        } catch (err) {
            console.error(err);
        }
        return results;
    }

    async getWishlist(
        paging: PaginationMovieDto,
        userId: number,
        lang: DefaultLanguage,
    ) {
        const { page = 1, limit = 20 } = paging;
        const cacheKey = `wishlist:${userId}:${lang}`;

        const start = (page - 1) * limit;
        const movies = await this.redisservice.getMovies(
            cacheKey,
            start,
            limit,
        );
        if (!movies || movies.length === 0) {
            const wishlistMovies = await this.progressRepo.find({
                where: { user: { id: userId }, isWishlisted: true },
                skip: start,
                take: limit,
                relations: ["movie"],
            });
            // const movieDetails = await Promise.all(wishlistMovies.map(async (progress) => await this.getMovieDetails(progress.movie.imdbId)));
            const imdbDate = (
                await Promise.all(
                    wishlistMovies?.map(async (m) => {
                        const movieDetails = await this.getMovieDetails(
                            m.movie.imdbId,
                            lang,
                            userId,
                        );
                        let movieInfo: MovieInfos;
                        if (movieDetails && "movie" in movieDetails) {
                            movieInfo = {
                                id: movieDetails.movie.id,
                                title: movieDetails.movie.title,
                                year: movieDetails.movie.year,
                                rating: movieDetails.movie.rating,
                                genres: movieDetails.movie.genres,
                                quality: movieDetails.movie.quality,
                                standard_audio_format:
                                    movieDetails.movie.standard_audio_format,
                                poster: movieDetails.movie.poster,
                                isWatched: m.isWatched,
                                overview: movieDetails.movie.overview,
                                size: movieDetails.movie.size,
                                time: movieDetails.movie.time,
                            };
                        } else if (movieDetails) {
                            movieInfo = {
                                id: movieDetails.id,
                                title: movieDetails.title,
                                year: movieDetails.year,
                                rating: movieDetails.rating,
                                genres: movieDetails.genres,
                                quality: movieDetails.quality,
                                standard_audio_format:
                                    movieDetails.standard_audio_format,
                                poster: movieDetails.poster,
                                isWatched: m.isWatched,
                                overview: movieDetails.overview,
                                size: movieDetails.size,
                                time: movieDetails.time,
                            };
                        } else {
                            movieInfo = {
                                id: m.movie.imdbId,
                                title: m.movie.title,
                                year: 0,
                                rating: 0,
                                genres: [],
                                quality: "-",
                                standard_audio_format: "-",
                                poster: "-",
                                isWatched: m.isWatched,
                                overview: "-",
                                size: 0,
                                time: 0,
                            };
                        }
                        return await this.imdbIdFromTMDB(movieInfo, lang);
                    }),
                )
            ).filter((m) => m.id);
            const yts_movie = await Promise.all(
                imdbDate.map(async (m) => await this.getMovieYTS(m)),
            );

            await this.redisservice.pushMovies(cacheKey, yts_movie);
            return {
                data: yts_movie,
                metadata: {
                    nextPage: page + 1,
                    hasMore:
                        (await this.redisservice.lenZSet(cacheKey)) >
                        page * limit,
                },
            };
        }
        return {
            data: movies,
            metadata: {
                nextPage: page + 1,
                hasMore:
                    (await this.redisservice.lenZSet(cacheKey)) > page * limit,
            },
        };
    }

    async getTrending(
        paging: PaginationMovieDto,
        lang: DefaultLanguage,
        userId?: number,
    ) {
        if (lang === "df") {
            const user = userId
                ? await this.userRepo.findOne({ where: { id: userId } })
                : null;
            lang = user?.preferredLanguage || "en";
        }

        const cacheKey = `trending${lang}`;
        const total = await this.redisservice.lenZSet(cacheKey);

        const { page = 1, limit = 20 } = paging;
        paging.language = lang;

        if (total < page * limit) {
            const tmdbTrending = await this.fetchTrendingFromTMDB(paging);
            const imdbDate = (
                await Promise.all(
                    tmdbTrending?.map(
                        async (m) =>
                            await this.imdbIdFromTMDB(
                                m,
                                (paging.language as DefaultLanguage) || "en",
                            ),
                    ),
                )
            ).filter((m) => m.id);
            const yts_movie = await Promise.all(
                imdbDate.map(async (m) => await this.getMovieYTS(m)),
            );
            if (yts_movie.length > 0) {
                await this.redisservice.pushMovies(cacheKey, yts_movie);
            }
        }
        const start = (page - 1) * limit;
        let movies = await this.redisservice.getMovies(cacheKey, start, limit);

        if (userId) {
            const moviesWithUserData = await Promise.all(
                movies.map((m) => this.extractUserMovieDetails(m.id, userId)),
            );
            movies = movies.map((movie: any, index) => ({
                ...movie,
                ...moviesWithUserData[index],
            }));
        }

        return {
            data: movies,
            metadata: {
                nextPage: page + 1,
                hasMore:
                    (await this.redisservice.lenZSet(cacheKey)) > page * limit,
            },
        };
    }

    private async dataUserIMDB(
        movie: MovieInfos,
        userId: number,
    ): Promise<MovieInfos> {
        const progress = await this.progressRepo.findOne({
            where: { user: { id: userId }, movie: { imdbId: movie.id } },
        });
        movie.isWatched = progress?.isWatched || false;
        return movie;
    }

    private async fetchFromTMDB(
        filters: FilterMovieDto,
    ): Promise<{ movies: MovieInfos[]; page: number }> {
        let resultResponse: any = [];

        const sortMap = {
            title: "title",
            popularity: "popularity",
            date: "primary_release_date",
            rating: "vote_average",
        };
        let currentPage = filters.page || 1;
        const limit = filters.limit || 20;
        const pagesToFetch = Math.ceil(
            ((filters.limit || 20) + 1) / (filters.limit || 20),
        );

        try {
            const isSearch = !!filters.query;
            const endpoint = isSearch ? "search/movie" : "discover/movie";
            const params: any = {
                api_key: process.env.TMDB_KEY,
                language: this.LANGS[filters.language || "en"],
            };

            if (isSearch) params["query"] = filters.query;
            if (filters.minYear)
                params["primary_release_date.gte"] = `${filters.minYear}-01-01`;
            if (filters.maxYear)
                params["primary_release_date.lte"] = `${filters.maxYear}-12-31`;

            params["sort_by"] =
                `${sortMap[filters.sortBy || "title"]}.${filters.order || "asc"}`;

            if (filters.genre && filters.genre !== "all") {
                if (this.TMDB_GENRE_MAP[filters.genre])
                    params["with_genres"] = this.TMDB_GENRE_MAP[filters.genre];
            }
            if (filters.minRating) {
                params["vote_average.gte"] = filters.minRating;
            }

            while (resultResponse.length <= limit) {
                const requests: any = [];

                for (let i = 0; i < pagesToFetch; i++) {
                    requests.push(
                        axios.get(`${process.env.TMDB_API}${endpoint}`, {
                            params: { ...params, page: currentPage + i },
                        }),
                    );
                }
                const responses = await Promise.all(requests);
                const data = responses.flatMap((res) => res.data.results || []);
                if (data.length === 0) break;

                const results: MovieInfos[] = (data || [])?.map((m: any) =>
                    this.normalizeMovie(m),
                );

                const imdbData = (
                    await Promise.all(
                        results?.map(
                            async (movie: any) =>
                                await this.imdbIdFromTMDB(
                                    movie,
                                    (filters.language as DefaultLanguage) ||
                                    "en",
                                ),
                        ),
                    )
                ).filter((m) => m && m.id);

                resultResponse.push(...imdbData);

                resultResponse = resultResponse.filter((m) => m.id);
                resultResponse = [
                    ...new Map(
                        resultResponse.map((item) => [item.id, item]),
                    ).values(),
                ];
                currentPage += pagesToFetch;
            }
        } catch (err) {
            console.error(err);
        }
        return { movies: resultResponse, page: currentPage };
    }

    async getHeroMovie(lang: DefaultLanguage) {
        const heroInfos: MovieInfos = {
            id: "",
            title: "",
            year: 0,
            rating: 0,
            genres: [],
            quality: "",
            standard_audio_format: "",
            poster: "",
            isWatched: false,
        };

        try {
            if (lang === "df") lang = "en";
            const hero = await this.redisservice.get(`hero${lang}`);
            if (hero) {
                const normalData = JSON.parse(hero);
                const randomItem =
                    normalData[Math.floor(Math.random() * normalData.length)];

                return randomItem;
            }

            const params: any = {
                api_key: process.env.TMDB_KEY,
                append_to_response: "external_ids",
                language: this.LANGS[lang] || "en-US",
            };
            const { data } = await axios.get(
                `${process.env.TMDB_API}trending/movie/day`,
                {
                    params,
                },
            );
            const allMovies = data.results;
            const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
                const el = this.normalizeMovie(movie);
                el.poster = `${process.env.TMDB_PICS}${movie.backdrop_path}`;
                return el;
            });
            const imdbData = await Promise.all(
                herosInfos?.map(
                    async (movie: any) =>
                        await this.imdbIdFromTMDB(movie, lang),
                ),
            );
            const yts_movies = await Promise.all(
                imdbData.map((movie) => this.getMovieYTS(movie)),
            );

            await this.redisservice.set(
                `hero${lang}`,
                JSON.stringify(yts_movies),
                86400,
            );

            const randomItem =
                yts_movies[Math.floor(Math.random() * allMovies.length)];
            return randomItem;
        } catch (err) {
            console.error(err);
        }
        return {};
    }

    async extractUserMovieDetails(imdbId: string, userId?: number) {
        const progress = await this.progressRepo.findOne({
            where: { user: { id: userId }, movie: { imdbId: imdbId } },
        });

        return {
            isWatched: progress?.isWatched || false,
            isWishlisted: progress?.isWishlisted || false,
            liked: progress?.likedOrDisliked === 1,
            disliked: progress?.likedOrDisliked === 2,
            lastWatchedTime: progress?.lastMinute || 0,
            totalMinutes: progress?.totalMinutes || 0,
        };
    }

    async getMovieDetails(
        imdbId: string,
        lang?: DefaultLanguage,
        userId?: number,
    ) {
        console.log(
            `Fetching movie details for imdbId: ${imdbId}, userId: ${userId}, language: ${lang}`,
        );

        let movie: MovieInfos | null = null;

        try {
            const { data } = await axios.get(
                `${process.env.TMDB_API}find/${imdbId}`,
                {
                    params: {
                        api_key: process.env.TMDB_KEY,
                        external_source: "imdb_id",
                        language: this.LANGS[lang || "en"] || "en-US",
                    },
                },
            );

            movie = data.movie_results?.[0]
                ? this.normalizeMovie(data.movie_results?.[0])
                : null;
            if (movie) {
                movie.id = imdbId;
                ((movie.poster = `${process.env.TMDB_PICS}${data.movie_results?.[0].backdrop_path}`),
                    (movie.overview = data.movie_results?.[0].overview));
            } else return movie;

            const tmdbId = data.movie_results?.[0].id;
            const creditsRes = await axios.get(
                `${process.env.TMDB_API}movie/${tmdbId}/credits`,
                {
                    params: {
                        api_key: process.env.TMDB_KEY,
                        language: this.LANGS[lang || "en"] || "en-US",
                    },
                },
            );

            const director =
                creditsRes.data.crew.find(
                    (member: any) => member.job === "Director",
                )?.name || "Unknown";
            const actors = creditsRes.data.cast
                .slice(0, 3)
                .map((actor: any) => ({
                    name: actor.name,
                    character: actor.character,
                }));
            movie = await this.getMovieYTS(movie, true);

            const dbMovie = await this.movieRepo.findOne({
                where: { imdbId },
                relations: ["subtitles"],
            });
            let commentCount = 0;
            if (dbMovie) {
                commentCount = await this.commentRepo.count({
                    where: { movie: { id: dbMovie.id } },
                });
            }
            const dbSubtitles = dbMovie?.subtitles?.map((s) => s.language) || [];
            const availableSubtitles = Array.from(new Set(["en", ...dbSubtitles]));

            const movieName = movie?.title || "Unknown";
            const movieRating = movie?.rating || 0;
            const productionYear = movie?.year || 0;
            const movieLength = movie?.time || 0;

            const baseResult = {
                id: imdbId,
                name: movieName,
                title: movieName,
                imdb: movieRating,
                rating: movieRating,
                production_year: productionYear,
                year: productionYear,
                length: movieLength,
                duration: movieLength,
                available_subtitles: availableSubtitles,
                subtitles: availableSubtitles,
                number_of_comments: commentCount,
                comments_count: commentCount,
                movie,
                director,
                actors,
            };

            if (userId) {
                const userMovieDetails = await this.extractUserMovieDetails(
                    imdbId,
                    userId,
                );

                return {
                    ...baseResult,
                    personnel: userMovieDetails,
                };
            }
            return baseResult;
        } catch (err) {
            console.error(err);
        }
        return movie;
    }

    async getCuratedTrending(lang: DefaultLanguage) {
        const cacheKey = `curated_trending_top_24_${lang}`;
        const cached = await this.redisservice.get(cacheKey);

        if (cached) return JSON.parse(cached);
        try {
            const params: any = {
                api_key: process.env.TMDB_KEY,
                append_to_response: "external_ids",
                language: this.LANGS[lang] || "en-US",
            };
            const { data } = await axios.get(
                `${process.env.TMDB_API}trending/movie/week`,
                {
                    params,
                },
            );
            const allMovies = data.results;
            const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
                const el = this.normalizeMovie(movie);
                el.poster = `${process.env.TMDB_PICS}${movie.backdrop_path}`;
                el.overview = movie.overview;

                return el;
            });
            const imdbData = await Promise.all(
                herosInfos?.map(
                    async (movie: any) =>
                        await this.imdbIdFromTMDB(movie, lang),
                ),
            );
            const yts_movies = await Promise.all(
                imdbData.map((movie) => this.getMovieYTS(movie, true)),
            );
            const curated: any[] = [];

            for (const movie of yts_movies) {
                if (curated.length == 4) break;
                if (movie.quality == "1080p" || movie.quality === "2160p") {
                    curated.push(movie);
                }
            }
            await this.redisservice.set(
                cacheKey,
                JSON.stringify(curated),
                86400,
            );

            return curated;
        } catch (err) {
            console.error(err);
        }
        return {};
    }

    async getTorrentMagnetsFromYTS(imdbId: string) {
        const SUPER_TRACKERS = [
            "udp://tracker.opentrackr.org:1337/announce",
            "udp://open.tracker.cl:1337/announce",
            "udp://tracker.openbittorrent.com:6969/announce",
            "http://tracker.openbittorrent.com:80/announce",
            "udp://opentracker.i2p.rocks:6969/announce",
            "https://opentracker.i2p.rocks:443/announce",
            "udp://tracker.torrent.eu.org:451/announce",
            "udp://explodie.org:6969/announce",
            "udp://tracker.internetwarriors.net:1337/announce",
            "udp://p4p.arenabg.com:1337/announce",
            "udp://tracker.leechers-paradise.org:6969/announce",
        ];

        try {
            const { data } = await axios.get(
                `${process.env.LINK_API_MOVIES_LIST_YTS}movie_details.json`,
                {
                    params: { imdb_id: imdbId },
                },
            );

            const torrents: any[] = data?.data?.movie?.torrents ?? [];

            return torrents.map((t) => {
                const combinedTrackers = Array.from(
                    new Set([...YTS_TRACKERS, ...SUPER_TRACKERS]),
                );

                const trackerString = combinedTrackers
                    .map((tr) => `&tr=${encodeURIComponent(tr)}`)
                    .join("");

                const magnet = `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(data.data.movie.title)}${trackerString}`;

                return {
                    magnet,
                    seeds: t.seeds as number,
                    peers: t.peers as number,
                    quality: t.quality as string,
                    size: t.size as string,
                    language: data?.data?.movie?.language as string,
                };
            });
        } catch (err) {
            console.error(
                `YTS fetch error ${imdbId} before starting streaming:`,
                err,
            );
        }
        return undefined;
    }

    async insertOrUpdateInteraction(
        userId: number,
        imdbId: string,
        interaction: number,
    ) {
        const movie = await this.ensureMovie(imdbId);

        let progress = await this.progressRepo.findOne({
            where: { user: { id: userId }, movie: { id: movie.id } },
        });

        if (!progress) {
            progress = this.progressRepo.create({
                user: { id: userId },
                movie,
            });
        } else {
            if (progress.likedOrDisliked === interaction) {
                progress.likedOrDisliked = 0;
                const result = this.progressRepo.save(progress);
                await this.addToHistory(userId, movie.id, "nutral");
                return result;
            } else {
                progress.likedOrDisliked = interaction;
            }
        }

        const result = this.progressRepo.save(progress);

        await this.addToHistory(
            userId,
            movie.id,
            interaction === 1 ? "liked" : "disliked",
        );

        return result;
    }

    async toggleWishlist(userId: number, imdbId: string) {
        const movie = await this.ensureMovie(imdbId);

        let progress = await this.progressRepo.findOne({
            where: { user: { id: userId }, movie: { id: movie.id } },
        });

        if (!progress) {
            progress = this.progressRepo.create({
                user: { id: userId },
                movie,
            });
        } else {
            if (progress.isWishlisted) {
                progress.isWishlisted = false;
                const result = this.progressRepo.save(progress);
                this.redisservice.del(`wishlist:${userId}`);
                this.addToHistory(userId, movie.id, "removed_from_wishlist");
                return result;
            }
        }

        progress.isWishlisted = !progress.isWishlisted;

        const result = this.progressRepo.save(progress);

        this.redisservice.del(`wishlist:${userId}`);
        this.addToHistory(
            userId,
            movie.id,
            progress.isWishlisted
                ? "added_to_wishlist"
                : "removed_from_wishlist",
        );

        return result;
    }

    async updateProgress(
        userId: number,
        imdbId: string,
        seconds: number,
        isLive: boolean,
    ) {
        let movie = await this.movieRepo.findOne({ where: { imdbId } });
        if (!movie) throw new Error("Movie not found locally");

        let progress = await this.progressRepo.findOne({
            where: { user: { id: userId }, movie: { id: movie.id } },
        });

        if (!progress) {
            progress = this.progressRepo.create({
                user: { id: userId },
                movie,
            });
        }

        progress.lastMinute = seconds;
        progress.isWatched = true;
        progress.wasWatchedLive = isLive || progress.wasWatchedLive;

        return this.progressRepo.save(progress);
    }

    private async ensureMovie(imdbId: string) {
        let movie = await this.movieRepo.findOne({ where: { imdbId } });
        if (movie) return movie;

        const movieDetails = await this.getMovieDetails(imdbId);
        if (!movieDetails) {
            return await this.movieRepo.save({
                imdbId,
                title: "Unknown",
                year: 0,
                ratingTmdb: 0,
                genres: [],
            });
        }

        if (typeof movieDetails === "object" && "movie" in movieDetails) {
            const { movie: movieInfo } = movieDetails;
            return await this.movieRepo.save({
                imdbId: movieInfo.id,
                title: movieInfo.title,
                year: movieInfo.year,
                ratingTmdb: movieInfo.rating,
                genres: movieInfo.genres,
            });
        }

        return await this.movieRepo.save({
            imdbId: movieDetails.id,
            title: movieDetails.title,
            year: movieDetails.year,
            ratingTmdb: movieDetails.rating,
            genres: movieDetails.genres,
        });
    }

    async findByImdbId(imdbId: string) {
        return this.movieRepo.findOne({ where: { imdbId } });
    }

    async saveMoviebyImdbId(imdbId: string) {
        const movieDetails = await this.getMovieDetails(imdbId);
        if (!movieDetails) {
            return await this.movieRepo.save({
                imdbId,
                title: "Unknown",
                year: 0,
                ratingTmdb: 0,
                genres: [],
            });
        }

        if (typeof movieDetails === "object" && "movie" in movieDetails) {
            const { movie: movieInfo } = movieDetails;
            return await this.movieRepo.save({
                imdbId: movieInfo.id,
                title: movieInfo.title,
                year: movieInfo.year,
                ratingTmdb: movieInfo.rating,
                genres: movieInfo.genres,
            });
        }

        return await this.movieRepo.save({
            imdbId: movieDetails.id,
            title: movieDetails.title,
            year: movieDetails.year,
            ratingTmdb: movieDetails.rating,
            genres: movieDetails.genres,
        });
    }
    // History management methods:
    async addToHistory(userId: number, movie_id: number, action: string) {
        return this.historyRepo.save({
            user: { id: userId },
            movie: { id: movie_id },
            action,
        });
    }

    // async getHistory(userId: number, page: number = 1, limit: number = 20, lastActionDate: Date) {
    async getHistory(userId: number, page: number = 1, limit: number = 20) {
        const [history, total] = await this.historyRepo.findAndCount({
            // where: { user: { id: userId }, actionDate: LessThanOrEqual(lastActionDate) },
            where: { user: { id: userId } },
            order: { actionDate: "DESC" },
            skip: (page - 1) * limit,
            take: limit,
            relations: ["movie"],
        });

        const processedHistory = await Promise.all(
            history.map(async (h) => {
                const movieDetails = await this.getMovieDetails(h.movie.imdbId);
                let movieInfo: MoviesHistory;
                if (movieDetails && "movie" in movieDetails) {
                    movieInfo = {
                        id: movieDetails.movie.id,
                        title: movieDetails.movie.title,
                        year: movieDetails.movie.year,
                        rating: movieDetails.movie.rating,
                        genres: movieDetails.movie.genres,
                        quality: movieDetails.movie.quality,
                        standard_audio_format:
                            movieDetails.movie.standard_audio_format,
                        poster: movieDetails.movie.poster,
                        isWatched: h.action === "watched",
                        overview: movieDetails.movie.overview,
                        size: movieDetails.movie.size,
                        time: movieDetails.movie.time,
                        action: h.action,
                        actionDate: h.actionDate,
                    };
                } else if (movieDetails) {
                    movieInfo = {
                        id: movieDetails.id,
                        title: movieDetails.title,
                        year: movieDetails.year,
                        rating: movieDetails.rating,
                        genres: movieDetails.genres,
                        quality: movieDetails.quality,
                        standard_audio_format:
                            movieDetails.standard_audio_format,
                        poster: movieDetails.poster,
                        isWatched: h.action === "watched",
                        overview: movieDetails.overview,
                        size: movieDetails.size,
                        time: movieDetails.time,
                        action: h.action,
                        actionDate: h.actionDate,
                    };
                } else {
                    movieInfo = {
                        id: h.movie.imdbId,
                        title: h.movie.title,
                        year: 0,
                        rating: 0,
                        genres: [],
                        quality: "-",
                        standard_audio_format: "-",
                        poster: "-",
                        isWatched: h.action === "watched",
                        overview: "-",
                        size: 0,
                        time: 0,
                        action: h.action,
                        actionDate: h.actionDate,
                    };
                }
                return movieInfo;
            }),
        );

        return {
            data: processedHistory,
            metadata: {
                nextPage: page + 1,
                hasMore: total > page * limit,
            },
        };
    }

    async sendInvite(
        imdbId: string,
        title: string,
        userInput: string,
        currentUserId: number,
    ) {
        const findUser = await this.userRepo.findOne({
            where: [{ email: userInput }, { username: userInput }],
        });
        if (!findUser) {
            throw new NotFoundException("user Not Found");
        }
        if (findUser.id === currentUserId) {
            throw new BadRequestException(
                "You cannot send a watch invite to yourself.",
            );
        }

        const checkRedis = await this.redisservice.get(
            `invite:${findUser.id}:${imdbId}:${currentUserId}`,
        );
        if (checkRedis) {
            return {
                message: "Invite already sent recently.",
                inviteLink: `${process.env.PUBLIC_API_URL}/movies/invite/${checkRedis}?accept=true`,
                token: checkRedis,
            };
        }
        const uuid = uuidv4();
        await this.redisservice.set(
            `invite:${findUser.id}:${imdbId}:${currentUserId}`,
            uuid,
            900,
        );

        const inviteLink = `${process.env.PUBLIC_API_URL}/movies/invite/${uuid}`;
        await this.emailsService.sendInviteEmail(findUser, title, inviteLink);

        return {
            message: "Invite sent successfully.",
            inviteLink: `${inviteLink}?accept=true`,
            token: uuid,
        };
    }

    async handleInvite(uuid: string, currentUserId: number, status: boolean) {
        const keys = await this.redisservice.getKeysByPattern("invite:*");
        for (const key of keys) {
            const storedToken = await this.redisservice.get(key);

            if (storedToken === uuid) {
                const [_, storedId, imdbId, hostId] = key.split(":");

                if (storedId === currentUserId.toString()) {
                    await this.redisservice.del(key);
                    if (status == true) {
                        const roomId = `${uuid}`;
                        this.movieGateway.notifyHostInviteAccepted(
                            hostId,
                            roomId,
                            storedId,
                        );
                        return {
                            message: "Invite accepted successfully!",
                            roomId,
                            imdbId: imdbId,
                        };
                    }
                    return { message: "Invite declined successfully." };
                }
                break;
            }
        }
        throw new NotFoundException("The invite isn't valid!");
    }

    async getQualitiesAvailable(imdbId: string) {
        const qualities = await this.getTorrentMagnetsFromYTS(imdbId);
        const availableQualitiesSeeds =
            qualities?.filter((q) => q.seeds > 0) || [];

        if (availableQualitiesSeeds.length === 0) {
            throw new NotFoundException("No qualities available for this movie.");
        }

        return { qualities: Array.from(new Set(availableQualitiesSeeds.map((q) => q.quality))) || [], language: qualities?.[0].language || "en" };
    }

    async searchSubtitles(imdbId: string) {
        let redisValue: any = await this.redisservice.get(
            `subtitles:${imdbId}`,
        );
        if (redisValue) {
            redisValue = JSON.parse(redisValue).map((s: any) => {
                const { url, ...rest } = s;
                return rest;
            });
            return [
                ...new Map(
                    (redisValue || []).map((item) => [item.language, item]),
                ).values(),
            ];
        }
        try {
            const response = await axios.get(`${process.env.SUBDL_API_URL}`, {
                params: {
                    api_key: process.env.SUBDL_API_KEY,
                    imdb_id: imdbId,
                },
            });

            let reformedData = (response.data?.subtitles || []).map(
                (subtitle: any) => ({
                    lang: subtitle.lang,
                    language: subtitle.language,
                    url: subtitle.url,
                    urlLink: `${process.env.PUBLIC_API_URL}/movies/subtitle_file/${imdbId}?language=${subtitle.lang}`,
                }),
            );

            this.redisservice.set(
                `subtitles:${imdbId}`,
                JSON.stringify(reformedData),
                36000,
            );

            reformedData = reformedData.map((s: any) => {
                const { url, ...rest } = s;
                return rest;
            });
            const uniqueByLangs = [
                ...new Map(
                    reformedData.map((item) => [item.language, item]),
                ).values(),
            ];
            return uniqueByLangs;
        } catch (error) {
            console.error(`Error fetching subtitles for ${imdbId}:`, error);
            throw new Error("Failed to fetch subtitles.");
        }
    }

    async getDownloadedFileLink(imdbId: string, language: string) {
        const fileName = `subtitle_${imdbId}_${language}`;
        const filePath = path.join(process.cwd(), "downloads", `${fileName}`);

        if (existsSync(filePath)) {
            return filePath;
        }
        const redisValue = await this.redisservice.get(`subtitles:${imdbId}`);
        if (!redisValue) {
            throw new NotFoundException(
                `No subtitles found for language ${language}`,
            );
        }
        const subtitles = JSON.parse(redisValue);
        const subtitle = subtitles.find((s: any) => s.lang === language);
        if (!subtitle) {
            throw new NotFoundException(
                `No subtitles found for language ${language}`,
            );
        }

        const response = await axios.get(
            `${process.env.SUBDL_DWN_URL}${subtitle.url}`,
            { responseType: "arraybuffer" },
        );
        const zip = new AdmZip(Buffer.from(response.data));
        const zipEntries = zip.getEntries();

        const subFile = zipEntries.find(
            (entry) =>
                !entry.isDirectory && /\.(srt|vtt|ass)$/i.test(entry.entryName),
        );

        if (!subFile) {
            throw new InternalServerErrorException(
                "Archive downloaded, but no valid subtitle file was found inside.",
            );
        }

        const extractedBuffer = subFile.getData();
        await fsPromises.writeFile(filePath, extractedBuffer);

        return filePath;
    }

    async createMovieEntry(imdbId: string) {
        const existingMovie = await this.movieRepo.findOne({
            where: { imdbId: imdbId },
        });
        if (existingMovie) {
            return existingMovie;
        }
        const movieDetails = await this.getMovieDetails(imdbId);
        if (!movieDetails) {
            return await this.movieRepo.save({
                imdbId,
                title: "Unknown",
                year: 0,
                ratingTmdb: 0,
                genres: [],
            });
        }

        if (typeof movieDetails === "object" && "movie" in movieDetails) {
            const { movie: movieInfo } = movieDetails;
            return await this.movieRepo.save({
                imdbId: movieInfo.id,
                title: movieInfo.title,
                year: movieInfo.year,
                ratingTmdb: movieInfo.rating,
                genres: movieInfo.genres,
                totalMinutes: movieInfo.time || 0,
            });
        }

        return await this.movieRepo.save({
            imdbId: movieDetails.id,
            title: movieDetails.title,
            year: movieDetails.year,
            ratingTmdb: movieDetails.rating,
            genres: movieDetails.genres,
            totalMinutes: movieDetails.time || 0,
        });
    }

    async markMovieCurrentTime(
        userId: string | undefined,
        currentTime: number,
        imdbId: string,
    ) {
        if (!userId) return;

        let movie = await this.movieRepo.findOne({ where: { imdbId } });
        if (!movie) {
            try {
                movie = await this.createMovieEntry(imdbId);
            } catch (err) {
                movie = await this.movieRepo.findOneByOrFail({ imdbId });
            }
        }
        const numericUserId = Number(userId);
        const progress = await this.progressRepo.findOne({
            where: { user: { id: numericUserId }, movie: { id: movie.id } },
        });

        if (!progress) {
            try {
                await this.progressRepo.save({
                    user: { id: numericUserId },
                    movie: { id: movie.id },
                    lastMinute: currentTime,
                });
            } catch {
                await this.progressRepo.update(
                    { user: { id: numericUserId }, movie: { id: movie.id } },
                    { lastMinute: currentTime }
                );
            }
        } else {
            await this.progressRepo.update(progress.id, {
                lastMinute: currentTime,
            });
        }
    }

    async getMovieCurrentTime(imdbId: string, userId: string) {
        return await this.progressRepo.findOne({
            where: { user: { id: Number(userId) }, movie: { imdbId: imdbId } },
        });
    }
}
