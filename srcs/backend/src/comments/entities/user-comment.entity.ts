import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class CommentCommentInteraction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("int")
    interaction!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, (user) => user.commentCommentInteractions, {
        onDelete: "CASCADE",
    })
    user!: User;

    @ManyToOne(() => Comment, (comment) => comment.commentCommentInteractions, {
        onDelete: "CASCADE",
    })
    comment!: Comment;

}
