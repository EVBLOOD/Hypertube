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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Movie,
            Subtitle,
            UserMovieProgress,
            UserMovieHistory,
        ]),
        forwardRef(() => StreamsModule),
    ],
    controllers: [MoviesController],
    providers: [MoviesService, RedisModule],
    exports: [MoviesService],
})
export class MoviesModule {}
