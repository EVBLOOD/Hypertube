import { useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useCuratedMovies = () => {
    return useQuery({
        queryKey: ["movie", "curted"],
        queryFn: MovieService.getCuratedMovies,
    });
};
