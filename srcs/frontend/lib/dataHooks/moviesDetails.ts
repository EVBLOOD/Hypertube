import { useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useMovieDetails = (id: string) => {
    return useQuery({
        queryKey: ["movies", id],
        queryFn: MovieService.getMovieDetails,
    });
};
