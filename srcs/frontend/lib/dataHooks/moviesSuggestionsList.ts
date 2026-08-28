import { useInfiniteQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useSuggestionsList = (filters: {
    genre: string;
    minYear: number;
    maxYear: number;
    minRating: number;
    sortBy: string;
    query: string;
    order: string;
}) => {
    return useInfiniteQuery({
        queryKey: ["movies", "suggestions", filters],
        queryFn: MovieService.getLibrary,
        initialPageParam: 1,
        getNextPageParam: (lastpage) =>
            lastpage.metadata.hasMore ? lastpage.metadata.nextPage : undefined,
        staleTime: 1000 * 60 * 5,
    });
};
