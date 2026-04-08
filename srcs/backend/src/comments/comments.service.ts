import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async create(userId: number, imdbId: string, content: string) {
    // Note: You'd first find the Movie entity by imdbId
    const comment = this.commentRepo.create({
      content,
      user: { id: userId },
      movie: { imdbId }, 
    });
    return this.commentRepo.save(comment);
  }

  async findByMovie(imdbId: string) {
    return this.commentRepo.find({
      where: { movie: { imdbId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}