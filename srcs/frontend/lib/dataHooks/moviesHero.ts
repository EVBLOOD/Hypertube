import { useQuery } from "@tanstack/react-query"
import MovieService from "../services/MovieService"


export const useMovieHero = () => {
    return useQuery({
        queryKey: ['movies', 'hero'],
        queryFn: MovieService.getHero,
    })
}