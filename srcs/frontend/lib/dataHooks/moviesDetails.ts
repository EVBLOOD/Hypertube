import { useQuery } from "@tanstack/react-query";
import MovieService from "../services/MovieService";

export const useMovieDetails = (id: string) => {
    return useQuery({
        queryKey: ["movies", id],
        queryFn: MovieService.getMovieDetails,
    });
};

// export const useMovieDetails = (id: string) => {
//     return useQuery({
//         queryKey: ["movies", id],
//         queryFn: () => MovieService.getMovieDetails(id), // Pass id explicitly
//         enabled: !!id, // Prevents query from running if id is undefined/null
//     });
// };
