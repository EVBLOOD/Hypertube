import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subtitle } from './subtitle.entity';
import { UserMovieProgress } from './user-movie-progress.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  imdbId!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  filePath!: string; // in the server

  @UpdateDateColumn()
  lastWatchedAt!: Date;

  @Column({ default: false })
  isFullyDownloaded!: boolean;

  @OneToMany(() => Subtitle, (subtitle) => subtitle.movie)
  subtitles!: Subtitle[];

  @OneToMany(() => UserMovieProgress, (progress) => progress.movie)
  userProgress!: UserMovieProgress[];
}