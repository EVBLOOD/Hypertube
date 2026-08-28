import { useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

const useMovieWatch = (movieId: string) => {
    return useQuery({
        queryKey: ["movie", "watch", movieId],
        queryFn: () =>
            MovieService.getMovieDetails({ queryKey: ["movie", movieId] }),
    });
};

const useMovieQualities = (imdbId: string) => {
    return useQuery({
        queryKey: ["movie", "qualities", imdbId],
        queryFn: () => MovieService.getMovieQualities(imdbId),
    });
};

const useMovieSubtitles = (imdbId: string) => {
    return useQuery({
        queryKey: ["movie", "subtitles", imdbId],
        queryFn: () => MovieService.getMovieSubtitles(imdbId),
    });
};

export { useMovieQualities, useMovieSubtitles, useMovieWatch };
