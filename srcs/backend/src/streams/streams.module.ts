import { forwardRef, Module } from "@nestjs/common";
import { StreamsService } from "./streams.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "src/movies/entities/movie.entity";
import { Subtitle } from "src/movies/entities/subtitle.entity";
import { UserMovieProgress } from "src/movies/entities/user-movie-progress.entity";
import { MoviesModule } from "src/movies/movies.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Movie, Subtitle, UserMovieProgress]),
        forwardRef(() => MoviesModule),
    ],
    providers: [StreamsService],
    exports: [StreamsService],
})
export class StreamsModule {}
