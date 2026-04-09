import api from "@/lib/api";
import type { Login, Register } from "@/types/apiTypes";

export default {
    login(loginData: Login) {
        api.post('/auth/login', loginData)
    },
    logout() {
        api.post('/auth/logout')

    },
    register(userDate: Register) {
        api.post('/auth/register', userDate)
    }
}