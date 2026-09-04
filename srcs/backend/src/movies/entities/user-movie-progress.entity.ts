import { Movie } from "./movie.entity";
import { User } from "src/users/entities/user.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    Unique,
} from "typeorm";

export enum UserInteraction {
    NEUTRAL = 0,
    LIKED = 1,
    DISLIKED = 2,
}

@Entity()
@Unique(["user", "movie"])
export class UserMovieProgress {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.watchHistory)
    user!: User;

    @Column({ default: false })
    isWishlisted!: boolean;

    @Column({
        type: "enum",
        enum: UserInteraction,
        default: UserInteraction.NEUTRAL,
    })
    likedOrDisliked!: number;

    @ManyToOne(() => Movie, (movie) => movie.userProgress)
    movie!: Movie;

    @Column({ default: 0.0, type: "float" })
    lastMinute!: number;

    // @Column({ default: 0.0, type: "float" })
    // totalMinutes!: number;

    @Column({ default: false })
    isWatched!: boolean;

    @Column({ default: false })
    wasWatchedLive!: boolean;

    @UpdateDateColumn()
    updatedAt!: Date;
}
