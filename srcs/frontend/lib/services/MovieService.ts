import api from "../api"

export default {
    async getLibrary() {
        return await api.get('/movies')
    }
}