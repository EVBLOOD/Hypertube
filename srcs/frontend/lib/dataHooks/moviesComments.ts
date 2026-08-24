import { useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useMovieComments = (
    id: string,
    pageParam: number,
    sortParam: string,
) => {
    return useQuery({
        queryKey: ["comments", id, pageParam, sortParam],
        queryFn: () =>
            MovieService.getComments({
                queryKey: ["comments", id, pageParam, sortParam],
            }),
    });
};
