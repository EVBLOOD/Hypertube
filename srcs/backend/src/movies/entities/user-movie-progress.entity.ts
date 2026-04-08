import { Movie } from './movie.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['user', 'movie'])
export class UserMovieProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.watchHistory)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.userProgress)
  movie: Movie;

  @Column({ default: 0 })
  lastMinute: number;

  @Column({ default: false })
  isWatched: boolean;

  @Column({ default: false })
  wasWatchedLive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}