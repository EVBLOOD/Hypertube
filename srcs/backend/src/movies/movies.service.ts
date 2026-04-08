import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import axios from 'axios';
import { FilterMovieDto } from './dto/filter-movie.dto';
import { UserMovieProgress } from './entities/user-movie-progress.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
    @InjectRepository(UserMovieProgress) private progressRepo: Repository<UserMovieProgress>,
  ) {}

  async getLibrary(filters: FilterMovieDto, userId: number) {
    // 1. Fetch from YTS/TMDb (External Source 1)
    const { data } = await axios.get('https://yts.mx/api/v2/list_movies.json', {
      params: {
        query_term: filters.query,
        genre: filters.genre,
        minimum_rating: filters.minRating,
        page: filters.page,
        sort_by: filters.sortBy,
      },
    });

    const movies = data.data.movies || [];

    // 2. Cross-reference with local DB for "isWatched" status
    const processedMovies = await Promise.all(movies.map(async (m: any) => {
      const progress = await this.progressRepo.findOne({
        where: { user: { id: userId }, movie: { imdbId: m.imdb_code } }
      });
      return {
        ...m,
        isWatched: progress?.isWatched || false,
      };
    }));

    return processedMovies;
  }

  async getMovieDetails(imdbId: string) {
    // 3. Fetch from OMDb (External Source 2) for mandatory cast/director info
    const { data } = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_KEY}`);
    return data;
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