import { forwardRef, Module } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MoviesController } from "./movies.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "./entities/movie.entity";
import { UserMovieProgress } from "./entities/user-movie-progress.entity";
import { Subtitle } from "./entities/subtitle.entity";
import { RedisModule } from "src/common/redis/redis.module";
import { StreamsModule } from "src/streams/streams.module";
import { UserMovieHistory } from "./entities/user-movie-history.entity";
import { User } from "src/users/entities/user.entity";
import { MailModule } from "src/mails/mails.module";
import { MovieGateway } from "./movies.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Movie,
            Subtitle,
            UserMovieProgress,
            UserMovieHistory,
            User
        ]),
        forwardRef(() => StreamsModule),
        MailModule
    ],
    controllers: [MoviesController],
    providers: [MoviesService, RedisModule, MovieGateway],
    exports: [MoviesService],
})
export class MoviesModule {}
