import api from "../api"

export default {
    async getLibrary({ pageParam = 1, queryKey }: { pageParam: number, queryKey: any }) {

        const [_key, _subKey, filters] = queryKey;
        const moviesPromiss = await api.get('/movies', {
            params: {
                page: pageParam,
                limit: 20,
                ...filters
            }
        })

        return moviesPromiss.data
    },
    async getTrending({ pageParam = 1 }: { pageParam: number, queryKey: any }) {

        return (await api.get('/movies/trending', {
            params: {
                page: pageParam,
                limit: 20,
            }
        })).data
    },
    async getHero() {
        const moviesPopular = await api.get('/movies/popular_one')
        return moviesPopular
    },
    async getMovieDetails({ queryKey }: any) {
        const [_key, movieId] = queryKey;
        const movieDetails = await api.get(`/movies/${movieId}`)
        return movieDetails
    },
    async getCuratedMovies() {
        return await api.get('/movies/curated')
    }
}