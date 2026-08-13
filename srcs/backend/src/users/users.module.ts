import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserMovieProgress } from "src/movies/entities/user-movie-progress.entity";
import { MoviesModule } from "src/movies/movies.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserMovieProgress]),
        MoviesModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
