import api from "../api"

export default {
    async getLibrary({pageParam = 1, queryKey}: {pageParam: number, queryKey: any}) {
        
        const [_key, _subKey, filters] = queryKey;
        const moviesPromiss = await api.get('/movies', {
            params: {
                page: pageParam,
                limit: 20,
                ...filters
            }
        })

        return moviesPromiss.data
    }
}