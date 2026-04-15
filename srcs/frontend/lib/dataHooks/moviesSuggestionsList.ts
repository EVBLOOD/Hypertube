import { useInfiniteQuery } from "@tanstack/react-query"
import MovieService from "../services/MovieService"


export const useSuggestionsList = () => {
    return useInfiniteQuery({
        queryKey: ['movies', 'suggestions'],
        queryFn: MovieService.getLibrary,
        initialPageParam: 1,
        getNextPageParam: (lastpage) => lastpage.hasMore ? lastpage.nextPage : undefined
    })
}