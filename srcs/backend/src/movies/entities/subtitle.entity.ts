import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class Subtitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  language: string;

  @Column()
  filePath: string;

  @ManyToOne(() => Movie)
  movie: Movie;
}