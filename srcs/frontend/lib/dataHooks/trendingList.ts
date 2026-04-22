import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import MovieService from "../services/MovieService"


export const useTrendings = () => {
    return (
        useInfiniteQuery(
            {
                queryKey: ['movie', 'trending'],
                queryFn: MovieService.getTrending,
                initialPageParam: 1,
                getNextPageParam: (lst) => lst.metadata.hasMore ? lst.metadata.nextPage : undefined
            }
        )
    )
}