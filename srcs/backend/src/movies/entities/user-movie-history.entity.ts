import { User } from "src/users/entities/user.entity";
import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Movie } from "./movie.entity";

@Entity()
export class UserMovieHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.userMovieHistories)
    user!: User;

    @ManyToOne(() => Movie, (movie) => movie.userMovieHistories)
    movie!: Movie;

    @Column()
    action!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    actionDate!: Date;
}
