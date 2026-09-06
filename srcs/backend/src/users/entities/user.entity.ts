import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
} from "typeorm";
import { Comment } from "src/comments/entities/comment.entity";
import { UserMovieProgress } from "src/movies/entities/user-movie-progress.entity";
import * as argon2 from "argon2";
import { IsEmail, IsNotEmpty } from "class-validator";
import { UserMovieHistory } from "src/movies/entities/user-movie-history.entity";
import { CommentCommentInteraction } from "src/comments/entities/user-comment.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @IsNotEmpty()
    username!: string;

    @Column({ select: false })
    password!: string;

    @Column({ unique: true, select: false })
    @IsEmail({}, { message: "Invalid email format" })
    email!: string;

    @Column()
    @IsNotEmpty()
    firstName!: string;

    @Column()
    @IsNotEmpty()
    lastName!: string;

    @Column({ nullable: true })
    profilePicture!: string;

    @Column({ default: false, select: false })
    isVerified!: boolean;

    @Column({ default: "public", select: false })
    privacy!: "public" | "private";

    @Column({ nullable: true, select: false  })
    emailVerificationToken!: string;

    @Column({ nullable: true, select: false })
    passwordResetToken!: string;

    @Column({ default: "en" })
    preferredLanguage!: "en" | "fr" | "ar";

    @Column({ nullable: true, select: false })
    fortyTwoId!: string;

    @Column({ nullable: true, select: false })
    externalStrategyId!: string;

    @OneToMany(() => Comment, (comment) => comment.user)
    comments!: Comment[];

    @OneToMany(() => UserMovieProgress, (progress) => progress.user)
    watchHistory!: UserMovieProgress[];

    @OneToMany(() => UserMovieHistory, (history) => history.user)
    userMovieHistories!: UserMovieHistory[];

    @OneToMany(
        () => CommentCommentInteraction,
        (interaction) => interaction.user,
    )
    commentCommentInteractions!: CommentCommentInteraction[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith("$argon2")) {
            this.password = await argon2.hash(this.password);
        }
    }
}
