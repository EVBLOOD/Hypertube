import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserMovieProgress, UserInteraction } from 'src/movies/entities/user-movie-progress.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserMovieProgress) private progressRepo: Repository<UserMovieProgress>,
  ) {}

  async findById(id: number, requestorId: number): Promise<User> {
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.id = :id', { id });

    // Privacy Rule: Only the owner sees their own email
    if (id === requestorId) {
      query.addSelect('user.email');
    }

    const user = await query.getOne();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    // Return all users for the "search" feature (excluding emails)
    return this.userRepo.find();
  }

  async getProfileSummary(userId: number) {
    const user = await this.findById(userId, userId);
    const progress = await this.progressRepo.find({
      where: { user: { id: userId } },
      relations: ['movie'],
      order: { updatedAt: 'DESC' },
      take: 8,
    });

    const stats = {
      watched: progress.filter((item) => item.isWatched).length,
      wishlisted: progress.filter((item) => item.isWishlisted).length,
      liked: progress.filter((item) => item.likedOrDisliked === UserInteraction.LIKED).length,
      disliked: progress.filter((item) => item.likedOrDisliked === UserInteraction.DISLIKED).length,
      totalInteractions: progress.length,
    };

    const history = progress.map((item) => ({
      id: item.movie.imdbId,
      title: item.movie.title,
      // year: item.movie.year,
      // poster: item.movie.poster,
      isWatched: item.isWatched,
      isWishlisted: item.isWishlisted,
      likedOrDisliked: item.likedOrDisliked,
      lastMinute: item.lastMinute,
      updatedAt: item.updatedAt,
    }));

    return {
      user,
      stats,
      history,
    };
  }
}