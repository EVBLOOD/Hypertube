import { Movie } from "src/movies/entities/movie.entity";
import { User } from "src/users/entities/user.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { CommentCommentInteraction } from "./user-comment.entity";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    content!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column("int", { default: 0 })
    likeCount!: number;

    @Column("int", { default: 0 })
    dislikeCount!: number;
    
    @Column("int", { default: 0 })
    userReaction!: number;

    @OneToMany(
        () => CommentCommentInteraction,
        (interaction) => interaction.comment,
    )
    commentCommentInteractions!: CommentCommentInteraction[];


    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
    user!: User;

    @ManyToOne(() => Movie, { onDelete: "CASCADE" })
    movie!: Movie;

}
