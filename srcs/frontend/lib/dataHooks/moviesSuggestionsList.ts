import { useInfiniteQuery } from "@tanstack/react-query"
import MovieService from "../services/MovieService"


export const useSuggestionsList = (filters: any) => {
    return useInfiniteQuery({
        queryKey: ['movies', 'suggestions', filters],
        queryFn: MovieService.getLibrary,
        initialPageParam: 1,
        getNextPageParam: (lastpage) => lastpage.metadata.hasMore ? lastpage.metadata.nextPage : undefined
    })
}