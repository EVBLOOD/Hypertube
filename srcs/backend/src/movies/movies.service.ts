import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, LessThanOrEqual, Repository } from "typeorm";
import { Movie } from "./entities/movie.entity";
import axios from "axios";
import { FilterMovieDto } from "./dto/filter-movie.dto";
import { UserMovieProgress } from "./entities/user-movie-progress.entity";
import { RedisService } from "src/common/redis/redis.service";
import { PaginationMovieDto } from "./dto/pagination-movie.dto ";
import { UserMovieHistory } from "./entities/user-movie-history.entity";

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
        private redisservice: RedisService,
    ) { }

    TMDB_GENRE_MAP = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Sci-Fi",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western",
    };

    normalizeMovie(movie: any, source: string): MovieInfos {
        if (source == "YTS") {
            return {
                id: movie.imdb_code,
                title: movie.title,
                year: movie.year,
                rating: movie.rating,
                genres: movie.genres,
                quality: "N/A",
                standard_audio_format: "N/A",
                poster: "N/A",
                isWatched: false,
            };
        } else if (source == "TMDB") {
            return {
                id: movie.id,
                title: movie.title,
                year: movie.release_date
                    ? movie.release_date.split("-")[0]
                    : "N/A",
                rating: movie.vote_average,
                genres: movie.genres,
                quality: "N/A",
                standard_audio_format: "N/A",
                poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                isWatched: false,
            };
        }
        return {
            id: movie.imdbId,
            title: movie.title,
            year: movie.year,
            rating: movie.ratingTmdb,
            genres: movie.genres,
            quality: "N/A",
            standard_audio_format: "N/A",
            poster: "N/A",
            isWatched: false,
        };
    }

    // public async getMoviePosterFromTMDB(imdbId: string): Promise<string | null> {
    //   try {
    //     const { data } = await axios.get(`${process.env.TMDB_API}movie/${imdbId}?api_key=${process.env.TMDB_KEY}&external_source=${imdbId}`);
    //     return data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
    //   } catch (err) {
    //     console.error(err);
    //     return null;
    //   }
    // }

    private async imdbIdFromTMDB(movie: MovieInfos): Promise<MovieInfos> {
        const cache = await this.redisservice.get(`metadata:${movie.id}`);
        if (cache) return JSON.parse(cache);

        try {
            const { data } = await axios.get(
                `${process.env.TMDB_API}movie/${movie.id}?api_key=${process.env.TMDB_KEY}&append_to_response=external_ids`,
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

    async getLibrary(filters: FilterMovieDto, userId: number) {
        const {
            query,
            genre,
            minRating,
            maxYear,
            minYear,
            page = 1,
            limit = 20,
            sortBy,
        } = filters;
        const cacheKey = `search:${userId}:${query || "all"}:${genre || "all"}`;
        const cachedCount = await this.redisservice.lenZSet(cacheKey);

        if (!query)
            filters = {
                genre,
                limit,
                minRating,
                maxYear,
                minYear,
                page,
                sortBy,
            };

        const needed = page * limit;

        if (cachedCount <= needed) {
            const tmdbMovies = await this.fetchFromTMDB(filters);
            const imdbData = (
                await Promise.all(
                    tmdbMovies?.map(
                        async (movie: any) => await this.imdbIdFromTMDB(movie),
                    ),
                )
            ).filter((m) => m.id);
            const yts_movies = await Promise.all(
                imdbData.map(async (movie) => await this.getMovieYTS(movie)),
            );

            if (yts_movies.length > 0) {
                await this.redisservice.pushMovies(cacheKey, yts_movies);
            }
        }

        const start = (page - 1) * limit;
        const movies = await this.redisservice.getMovies(
            cacheKey,
            start,
            limit,
        );
        let processedMovies: any[] = await Promise.all(
            movies.map((m) => this.dataUserIMDB(m, userId)),
        );
        const total = await this.redisservice.lenZSet(cacheKey);

        if (userId) {
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
                language: "en-US",
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
            results = (data || [])?.map((m: any) =>
                this.normalizeMovie(m, "TMDB"),
            );
        } catch (err) {
            console.error(err);
        }
        return results;
    }

    async getWishlist(paging: PaginationMovieDto, userId: number) {
        const { page = 1, limit = 20 } = paging;
        const cacheKey = `wishlist:${userId}`;

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
                        return await this.imdbIdFromTMDB(movieInfo);
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

    async getTrending(paging: PaginationMovieDto, userId?: number) {
        const { page = 1, limit = 20 } = paging;
        const cacheKey = `trending`;

        const total = await this.redisservice.lenZSet(cacheKey);

        if (total < page * limit) {
            const tmdbTrending = await this.fetchTrendingFromTMDB(paging);
            const imdbDate = (
                await Promise.all(
                    tmdbTrending?.map(
                        async (m) => await this.imdbIdFromTMDB(m),
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
    ): Promise<MovieInfos[]> {
        let results: MovieInfos[] = [];
        const sortMap = {
            title: "original_title",
            popularity: "popularity.desc",
            date: "primary_release_date.desc",
            rating: "vote_average.desc",
        };

        const pagesToFetch = Math.ceil(((filters.limit || 20) + 1) / 20);
        console.log(pagesToFetch);
        try {
            const isSearch = !!filters.query;
            const endpoint = isSearch ? "search/movie" : "discover/movie";
            const params: any = {
                api_key: process.env.TMDB_KEY,
                page: filters.page || 1,
                language: "en-US",
            };

            if (isSearch) {
                params.query = filters.query;
            } else {
                params.sort_by = sortMap[filters.sortBy || "popularity"];
                params["primary_release_date.gte"] = `${filters.minYear}-01-01`;
                params["primary_release_date.lte"] = `${filters.maxYear}-12-31`;

                if (filters.genre && filters.genre !== "all") {
                    params.with_genres = filters.genre;
                }
                if (filters.minRating) {
                    params["vote_average.gte"] = filters.minRating;
                }
            }
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
            results = (data || [])?.map((m: any) =>
                this.normalizeMovie(m, "TMDB"),
            );
        } catch (err) {
            console.error(err);
        }
        return results;
    }

    private async fetchFromYts(filters: FilterMovieDto) {
        try {
            const params: any = {
                genre: filters.genre,
                minimum_rating: filters.minRating,
                sort_by: filters.query
                    ? filters.sortBy || "title"
                    : filters.sortBy || "download_count",
                order_by: "desc",
                page: filters.page || 1,
                limit: filters.limit,
            };
            if (filters.query) params.query_term = filters.query;

            const { data } = await axios.get(
                `${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`,
                { params },
            );
            return (data.data.movies || [])?.map((m: any) =>
                this.normalizeMovie(m, "YTS"),
            );
        } catch (err) {
            console.error(`YTS Fetch Failed: ${err}`);
            return [];
        }
    }

    async getHeroMovie() {
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
            const hero = await this.redisservice.get(`hero`);
            if (hero) {
                const normalData = JSON.parse(hero);
                const randomItem =
                    normalData[Math.floor(Math.random() * normalData.length)];

                return randomItem;
            }

            const params: any = {
                api_key: process.env.TMDB_KEY,
                append_to_response: "external_ids",
                language: "en-US",
            };
            const { data } = await axios.get(
                `${process.env.TMDB_API}trending/movie/day`,
                {
                    params,
                },
            );
            const allMovies = data.results;
            const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
                const el = this.normalizeMovie(movie, "TMDB");
                el.poster = `${process.env.TMDB_PICS}${movie.backdrop_path}`;
                return el;
            });
            const imdbData = await Promise.all(
                herosInfos?.map(
                    async (movie: any) => await this.imdbIdFromTMDB(movie),
                ),
            );
            const yts_movies = await Promise.all(
                imdbData.map((movie) => this.getMovieYTS(movie)),
            );

            await this.redisservice.set(
                `hero`,
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
        };
    }

    async getMovieDetails(imdbId: string, userId?: number) {
        let movie: MovieInfos | null = null;
        try {
            const { data } = await axios.get(
                `${process.env.TMDB_API}find/${imdbId}`,
                {
                    params: {
                        api_key: process.env.TMDB_KEY,
                        external_source: "imdb_id",
                        language: "en-US",
                    },
                },
            );
            movie = data.movie_results?.[0]
                ? this.normalizeMovie(data.movie_results?.[0], "TMDB")
                : null;
            if (movie) {
                movie.id = imdbId;
                ((movie.poster = `${process.env.TMDB_PICS}${data.movie_results?.[0].backdrop_path}`),
                    (movie.overview = data.movie_results?.[0].overview));
            } else return movie;

            const tmdbId = data.movie_results?.[0].id;
            const creditsRes = await axios.get(
                `${process.env.TMDB_API}movie/${tmdbId}/credits`,
                { params: { api_key: process.env.TMDB_KEY } },
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

            if (userId) {
                const userMovieDetails = await this.extractUserMovieDetails(
                    imdbId,
                    userId,
                );

                return {
                    movie,
                    personnel: userMovieDetails,
                    director,
                    actors,
                };
            }
            return {
                movie,
                director,
                actors,
            };
        } catch (err) {
            console.error(err);
        }
        return movie;
    }

    async getCuratedTrending() {
        const cacheKey = "curated_trending_top_24";
        const cached = await this.redisservice.get(cacheKey);

        if (cached) return JSON.parse(cached);

        try {
            const params: any = {
                api_key: process.env.TMDB_KEY,
                append_to_response: "external_ids",
                language: "en-US",
            };
            const { data } = await axios.get(
                `${process.env.TMDB_API}trending/movie/week`,
                {
                    params,
                },
            );
            const allMovies = data.results;
            const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
                const el = this.normalizeMovie(movie, "TMDB");
                el.poster = `${process.env.TMDB_PICS}${movie.backdrop_path}`;
                el.overview = movie.overview;

                return el;
            });
            const imdbData = await Promise.all(
                herosInfos?.map(
                    async (movie: any) => await this.imdbIdFromTMDB(movie),
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
}
