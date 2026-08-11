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
    async getWishlist({ pageParam = 1 }: { pageParam: number, queryKey: any }) {
        return (await api.get('/movies/wishlist', {
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
    },

    async setInteraction({ queryKey, interaction }: { queryKey: any, interaction: number }) {
        const [_key, imdbId] = queryKey;
        return await api.post(`/movies/interaction/${imdbId}`, { interaction })
    },

    async toggleWishlist(movieId: string) {
        return await api.post(`/movies/wishlist/${movieId}`)
    },

    async getComments({ queryKey }: any) {
        const [_key, movieId] = queryKey;
        return (await api.get(`/comments/${movieId}`)).data
    },

    async postComment(movieId: string, content: string) {
        return await api.post(`/comments/${movieId}`, { content })
    }
}