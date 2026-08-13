import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useMoviesWishList = () => {
    return useInfiniteQuery({
        queryKey: ["movie", "wishlist"],
        queryFn: MovieService.getWishlist,
        initialPageParam: 1,
        getNextPageParam: (lst) =>
            lst.metadata.hasMore ? lst.metadata.nextPage : undefined,
    });
};
