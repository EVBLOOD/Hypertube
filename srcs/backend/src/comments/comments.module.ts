import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { UsersModule } from "src/users/users.module";
import { MoviesModule } from "src/movies/movies.module";
import { CommentCommentInteraction } from "./entities/user-comment.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, CommentCommentInteraction]),
        UsersModule,
        MoviesModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
