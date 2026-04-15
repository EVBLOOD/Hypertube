import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import axios from 'axios';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { UserMovieProgress } from './entities/user-movie-progress.entity';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
    @InjectRepository(UserMovieProgress) private progressRepo: Repository<UserMovieProgress>,
    private redisservice: RedisService
  ) { }

  normalizeMovie(movie: any, source: string) {
    if (source == 'YTS') {
      return {
        id: movie.imdb_code,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genres: movie.genres,
        // torrents: movie.torrents
      }
    }
    return {
      id: movie.imdbId,
      title: movie.title,
      year: movie.year,
      rating: movie.ratingTmdb,
      genres: movie.genres,
      // torrents: movie.torrents
    }


  }
  // https://torrentclaw.com/llms.txt https://torrentclaw.com/api/openapi.json

  async getLibrary(filters: FilterMovieDto, userId: number) {
    // ss
    const { query, genre, minRating, page = 1, limit = 20, sortBy } = filters;
    const cacheKey = `search:${userId}:${query || 'all'}:${genre || 'all'}`;
    let cachedCount = await this.redisservice.len(cacheKey)

    if (cachedCount < limit) {
      const [ytsResults, clawResults] = await Promise.allSettled([
        this.fetchFromYts({ ...filters, limit: 50 }),
        this.fetchFromTorrentClaw({ ...filters, limit: 50 }),
      ]);
      let movies: any[] = [];

      if (ytsResults.status === 'fulfilled') {
        movies.push(...ytsResults.value);
      }
      if (clawResults.status === 'fulfilled') {
        movies.push(...clawResults.value);
      }
      if (movies.length > 0) {
        await this.redisservice.pushMovies(cacheKey, ...(movies.map((m) => JSON.stringify(m))))
      }
    }
    const rawData = await this.redisservice.getMovies(cacheKey, limit);
    const movies = (rawData || []).map(m => {return JSON.parse(m)});

    const processedMovies = await Promise.all(movies.map((m) => this.dataUserIMDB(m, userId)))
    console.log(processedMovies)
    return {
      data: processedMovies,
      metadata: {
        nextPage: page + 1,
        hasMore: (await this.redisservice.len(cacheKey)) > 0 || processedMovies.length === limit
      }
    };

  }
  private async dataUserIMDB(movie: any, userId: number) {
    const [progress, details] = await Promise.all(
      [this.progressRepo.findOne({
        where: { user: { id: userId }, movie: { imdbId: movie.id } }
      }),
      this.getMovieDetails(movie.id)]
    )
    return {
      ...movie,
      title: details?.Title || movie.title,
      year: details?.Year || movie.year,
      rating: details?.imdbRating || movie.rating,
      genres: details?.Genre || movie.genres,
      poster: details?.Poster || '',
      quality: '1080P',
      standard_audio_format: '5.1 SURROUND',
      isWatched: progress?.isWatched || false,
    };
  }

  private async fetchFromYts(filters: FilterMovieDto) {
    try {
      const params = {
        query_term: filters.query,
        genre: filters.genre,
        minimum_rating: filters.minRating,
        sort_by: filters.query ? (filters.sortBy || 'title') : (filters.sortBy || 'download_count'),
        order_by: 'desc',
        page: filters.page || 1,
        limit: filters.limit,
      };

      const { data } = await axios.get(`${process.env.LINK_API_MOVIES_LIST_YTS}list_movies.json`, { params });
      return (data.data.movies || [])?.map((m: any) => this.normalizeMovie(m, 'YTS'));
    } catch (err) {
      console.log(`YTS Fetch Failed: ${err}`);
      return [];
    }
  }

  private async fetchFromTorrentClaw(filters: FilterMovieDto) {
    try {
      const isSearch = !!filters.query;
      const endpoint = isSearch ? 'search' : 'popular';

      const params = isSearch
        ? { q: filters.query, page: filters.page, genre: filters.genre, minimum_rating: filters.minRating }
        : { limit: filters.limit || 12, page: 1 };

      const { data } = await axios.get(`${process.env.LINK_API_MOVIES_LIST_TORRENTCLAW}${endpoint}`, {
        params,
        // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36
        headers: { 'User-Agent': 'Hypertube-Bot/1.0' }
      });
      // ss
      const results = data.items || data;
      // return (results || []).map((m: any) => this.normalizeMovie(m, 'other'));
      return [].map((m: any) => this.normalizeMovie(m, 'other'));
    } catch (err) {
      console.log(`Claw Fetch Failed: ${err}`);
      return [];
    }
  }


  async getMovieDetails(imdbId: string) {
    let movie: any = {}

    try {

      const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_KEY}`);
      movie = response.data
    } catch (err) {
      console.log(err);
    } finally {
      return movie
    }
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