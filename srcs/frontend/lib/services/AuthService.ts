import api from "@/lib/api";
import type { Login, Register } from "@/types/apiTypes";

export default {
    async login(loginData: Login) {
        return await api.post("/auth/login", loginData);
    },
    async logout() {
        return await api.post("/auth/logout");
    },
    async register(userDate: Register) {
        return await api.post("/auth/register", userDate);
    },
    async whois() {
        return await api.get("/auth/whois");
    },
};
