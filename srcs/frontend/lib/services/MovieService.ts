import api from "../api"

export default {
    async getLibrary({pageParam = 1}: {pageParam: number}) {

        const moviesPromiss = await api.get('/movies', {
            params: {
                page: pageParam,
                limit: 20
            }
        })

        return moviesPromiss.data
    }
}