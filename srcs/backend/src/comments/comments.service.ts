import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { MoviesService } from 'src/movies/movies.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    private readonly movieService: MoviesService,
  ) {}

  async create(userId: number, imdbId: string, content: string) {
    let movie = await this.movieService.findByImdbId(imdbId);
    if (!movie) {
      movie = await this.movieService.saveMoviebyImdbId(imdbId);
      if (!movie) {
        throw new Error(`Movie with IMDb ID ${imdbId} not found and could not be created.`);
      }
    }
    const comment = this.commentRepo.create({
      content,
      user: { id: userId },
      movie: { id: movie.id }, 
    });

    const saved = await this.commentRepo.save(comment);

    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
  }

  async findByMovie(imdbId: string) {
    return this.commentRepo.find({
      where: { movie: { imdbId: imdbId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}