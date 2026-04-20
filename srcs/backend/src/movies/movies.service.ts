import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import axios from 'axios';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { UserMovieProgress } from './entities/user-movie-progress.entity';
import { RedisService } from 'src/common/redis/redis.service';

export interface MovieInfos {
  id: string,
  title: string,
  year: number,
  rating: number,
  genres: string[],
  quality: string,
  standard_audio_format: string,
  poster: string,
  isWatched: boolean,
  overview?: string,
  size?: number,
  time?: number
}

export interface MovieLibrary {
  movies: MovieInfos,
  metadata: {
    nextPage: number,
    hasMore: boolean
  }
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
    @InjectRepository(UserMovieProgress) private progressRepo: Repository<UserMovieProgress>,
    private redisservice: RedisService
  ) { }
  TMDB_GENRE_MAP = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
  };

  normalizeMovie(movie: any, source: string): MovieInfos {
    if (source == 'YTS') {
      return {
        id: movie.imdb_code,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genres: movie.genres,
        quality: "N/A",
        standard_audio_format: "N/A",
        poster: "N/A",
        isWatched: false
      }
    } else if (source == 'TMDB') {
      return {
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
        rating: movie.vote_average,
        genres: movie.genres,
        quality: "N/A",
        standard_audio_format: "N/A",
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        isWatched: false
      }
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
      isWatched: false
    }
  }

  private async imdbIdFromTMDB(movie: MovieInfos): Promise<MovieInfos> {

    const cache = await this.redisservice.get(`metadata:${movie.id}`);
    if (cache) return JSON.parse(cache);

    try {
      const { data } = await axios.get(`${process.env.TMDB_API}movie/${movie.id}?api_key=${process.env.TMDB_KEY}&append_to_response=external_ids`);
      movie.id = data.imdb_id
      movie.genres = data.genres.map((g: { id: number, name: string }) => g.name)

      await this.redisservice.set(`metadata:${movie.id}`, JSON.stringify(movie), 600000);
    } catch (err) {
      console.log(err)
    }
    return movie;
  }
  private getQualityScore(q: string) {
    return q === '2160p' ? 3 : q === '1080p' ? 2 : 1;
  }
  async getMovieYTS(movie: MovieInfos, moreinfos = false): Promise<MovieInfos> {
    try {
      const { data } = await axios.get(`${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`, {
        params: {
          query_term: movie.id
        }
      });
      console.log(data)
      // ss
      const ytsMovie = data.data.movies?.[0]
      console.log(ytsMovie)
      // let streamInfo = {
      //   hasVideo: !!ytsMovie,
      //   quality: 'N/A',
      //   audio: 'STEREO',
      //   seeds: 0
      // };
      if (ytsMovie) {
        const best = ytsMovie.torrents.reduce((prev, curr) =>
          (this.getQualityScore(curr.quality) > this.getQualityScore(prev.quality)) ? curr : prev
        );
        movie.standard_audio_format = best.audio_channels === '5.1' ? '5.1 SURROUND' : 'STEREO'
        movie.quality = best.quality
        if (moreinfos) {
          movie.size = best.size
          movie.time = ytsMovie.runtime
        }
      }
    } catch (err) {
      console.log(err)
    }
    // ss
    return movie
  }

  async getLibrary(filters: FilterMovieDto, userId: number) {
    const { query, genre, minRating, maxYear, minYear, page = 1, limit = 20, sortBy } = filters;
    const cacheKey = `search:${userId}:${query || 'all'}:${genre || 'all'}`;
    let cachedCount = await this.redisservice.len(cacheKey)

    if (!query)
      filters = { genre, limit, minRating, maxYear, minYear, page, sortBy }
    if (cachedCount / page <= limit) {
      const tmdbMovies = await this.fetchFromTMDB(filters);
      const imdbData = (await Promise.all(tmdbMovies?.map(async (movie: any) => await this.imdbIdFromTMDB(movie)))).filter((m) => (m.id))
      const yts_movies = await Promise.all(imdbData.map((movie) => this.getMovieYTS(movie)))

      if (yts_movies.length > 0) {
        await this.redisservice.pushMovies(cacheKey, ...(yts_movies.map((m) => JSON.stringify(m))))
      }
    }
    // const rawData = await this.redisservice.getMovies(cacheKey, limit);
    const rawData = await this.redisservice.getMovies(cacheKey, (page - 1) * limit, page * limit - 1);

    const movies = (rawData || []).map(m => { return JSON.parse(m) });
    const processedMovies = await Promise.all(movies.map((m) => this.dataUserIMDB(m, userId)))


    return {
      data: processedMovies,
      metadata: {
        nextPage: page + 1,
        hasMore: (await this.redisservice.len(cacheKey)) > 0 || processedMovies.length === limit
      }
    };
  }
  private async dataUserIMDB(movie: MovieInfos, userId: number): Promise<MovieInfos> {
    const progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, movie: { imdbId: movie.id } }
    })
    movie.isWatched = progress?.isWatched || false
    return movie
  }

  private async fetchFromTMDB(filters: FilterMovieDto): Promise<MovieInfos[]> {
    let results: MovieInfos[] = []
    const sortMap = {
      title: 'original_title',
      popularity: 'popularity.desc',
      date: 'primary_release_date.desc',
      rating: 'vote_average.desc'
    };

    const pagesToFetch = Math.ceil(((filters.limit || 20) + 1) / 20);
    try {
      const isSearch = !!filters.query;
      const endpoint = isSearch ? 'search/movie' : 'discover/movie';
      const params: any = {
        api_key: process.env.TMDB_KEY,
        page: filters.page || 1,
        language: 'en-US',
      };

      if (isSearch) {
        params.query = filters.query;
      } else {
        params.sort_by = sortMap[filters.sortBy || "popularity"];
        params['primary_release_date.gte'] = `${filters.minYear}-01-01`;
        params['primary_release_date.lte'] = `${filters.maxYear}-12-31`;

        if (filters.genre && filters.genre !== 'all') {
          params.with_genres = filters.genre;
        }
        if (filters.minRating) {
          params['vote_average.gte'] = filters.minRating;
        }
      }
      const requests: any = []
      for (let i = 1; i <= pagesToFetch; i++) {
        requests.push(
          axios.get(`${process.env.TMDB_API}${endpoint}`, { params })
        )
      }
      const responses = await Promise.all(requests);
      const data = responses.flatMap(res => res.data.results || []);
      results = (data || [])?.map((m: any) => this.normalizeMovie(m, 'TMDB'));
    } catch (err) {
      console.log(err)
    }
    return results;
  }

  private async fetchFromYts(filters: FilterMovieDto) {
    // ss
    try {
      const params: any = {
        genre: filters.genre,
        minimum_rating: filters.minRating,
        sort_by: filters.query ? (filters.sortBy || 'title') : (filters.sortBy || 'download_count'),
        order_by: 'desc',
        page: filters.page || 1,
        limit: filters.limit,
      };
      if (filters.query) params.query_term = filters.query


      console.log(params)
      console.log(`${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`)
      const { data } = await axios.get(`${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`, { params });
      return (data.data.movies || [])?.map((m: any) => this.normalizeMovie(m, 'YTS'));
    } catch (err) {
      console.log(`YTS Fetch Failed: ${err}`);
      return [];
    }
  }

  private async fetchFromTorrentClaw(filters: FilterMovieDto) {
    try {
      // const isSearch = !!filters.query;
      // const endpoint = isSearch ? 'search' : 'popular';

      // const params = isSearch
      //   ? { q: filters.query, page: filters.page, genre: filters.genre, minimum_rating: filters.minRating }
      //   : { limit: filters.limit || 12, page: 1 };

      // const { data } = await axios.get(`${process.env.LINK_API_MOVIES_LIST_TORRENTCLAW}${endpoint}`, {
      //   params,
      //   // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36
      //   headers: { 'User-Agent': 'Hypertube-Bot/1.0' }
      // });
      // // ss
      // const results = data.items || data;
      // return (results || []).map((m: any) => this.normalizeMovie(m, 'other'));
      return [].map((m: any) => this.normalizeMovie(m, 'other'));
    } catch (err) {
      console.log(`Claw Fetch Failed: ${err}`);
      return [];
    }
  }

  async getHeroMovie() {
    // dd
    const heroInfos: MovieInfos = {
      id: '',
      title: '',
      year: 0,
      rating: 0,
      genres: [],
      quality: '',
      standard_audio_format: '',
      poster: '',
      isWatched: false
    }
    try {

      const hero = await this.redisservice.get(`hero`)
      if (hero) {
        const normalData = JSON.parse(hero)
        const randomItem = normalData[Math.floor(Math.random() * normalData.length)];

        return randomItem
      }

      const params: any = {
        api_key: process.env.TMDB_KEY,
        append_to_response: 'external_ids',
        language: 'en-US'
      };
      const { data } = await axios.get(`${process.env.TMDB_API}trending/movie/day`, {
        params
      });
      const allMovies = data.results
      // ss
      const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
        const el = this.normalizeMovie(movie, 'TMDB');
        el.poster = "https://image.tmdb.org/t/p/original/" + movie.backdrop_path;
        return el
      })
      const imdbData = await Promise.all(herosInfos?.map(async (movie: any) => await this.imdbIdFromTMDB(movie)))
      const yts_movies = await Promise.all(imdbData.map((movie) => this.getMovieYTS(movie)))

      await this.redisservice.set(`hero`, JSON.stringify(yts_movies), 86400)

      const randomItem = yts_movies[Math.floor(Math.random() * allMovies.length)];
      return randomItem
    } catch (err) {
      console.log(err)
    }
    return {}
  }

  async getMovieDetails(imdbId: string) {
    let movie: MovieInfos | null = null
    try {
      const { data } = await axios.get(`${process.env.TMDB_API}find/${imdbId}`, {
        params: {
          api_key: process.env.TMDB_KEY,
          external_source: 'imdb_id',
          language: 'en-US'
        }
      });
      movie = data.movie_results?.[0] ? this.normalizeMovie(data.movie_results?.[0], 'TMDB') : null
      if (movie) {
        movie.id = imdbId;
        movie.poster = `https://image.tmdb.org/t/p/original${data.movie_results?.[0].backdrop_path}`,
        movie.overview = data.movie_results?.[0].overview;
      } else return movie
      const tmdbId = data.movie_results?.[0].id
      // credits
      const creditsRes = await axios.get(
        `${process.env.TMDB_API}movie/${tmdbId}/credits`,
        { params: { api_key: process.env.TMDB_KEY } }
      );

      const director = creditsRes.data.crew.find((member: any) => member.job === 'Director')?.name || 'Unknown';
      const actors = creditsRes.data.cast.slice(0, 3).map((actor: any) => ({
        name: actor.name,
        character: actor.character,
      }));
      // best 
      movie = await this.getMovieYTS(movie, true);

      return {
        movie,
        director,
        actors
      }
    } catch (err) {
      console.log(err);
    }
    return movie
  }


  async getCuratedTrending() {
    const cacheKey = 'curated_trending_top_24';
    const cached = await this.redisservice.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const params: any = {
        api_key: process.env.TMDB_KEY,
        append_to_response: 'external_ids',
        language: 'en-US'
      };
      const { data } = await axios.get(`${process.env.TMDB_API}trending/movie/week`, {
        params
      });
      const allMovies = data.results
      const herosInfos: MovieInfos[] = allMovies.map((movie: any) => {
        const el = this.normalizeMovie(movie, 'TMDB');
        el.poster = "https://image.tmdb.org/t/p/original/" + movie.backdrop_path;
        el.overview = movie.overview;

        return el
      })
      const imdbData = await Promise.all(herosInfos?.map(async (movie: any) => await this.imdbIdFromTMDB(movie)))
      const yts_movies = await Promise.all(imdbData.map((movie) => this.getMovieYTS(movie, true)))
      const curated : any[] = [];
      for (const movie of yts_movies) {
        if (curated.length == 4) break
        if (movie.quality == '1080p' || movie.quality === '2160p') {
          curated.push(movie)
        }
      }
      await this.redisservice.set(cacheKey, JSON.stringify(yts_movies), 86400)
      
      // ss
      return curated;
    } catch (err) {
      console.log(err);
    }
    return {};
  }
  async updateProgress(userId: number, imdbId: string, seconds: number, isLive: boolean) {
    let movie = await this.movieRepo.findOne({ where: { imdbId } });
    if (!movie) throw new Error('Movie not found locally');

    let progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, movie: { id: movie.id } }
    });

    if (!progress) {
      progress = this.progressRepo.create({ user: { id: userId }, movie });
    }

    progress.lastMinute = seconds;
    progress.isWatched = true;
    progress.wasWatchedLive = isLive || progress.wasWatchedLive;

    return this.progressRepo.save(progress);
  }
}