import api from "@/lib/api";
import type { Login, Register } from "@/types/apiTypes";

const authService = {
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
    async requestResetPassword(email: string) {
        return await api.post("/auth/request-reset-password", { email });
    },
    async resetPassword(token: string, newPassword: string) {
        return await api.post("/auth/reset-password", { token, newPassword });
    },
    async verifyEmail(token: string) {
        return await api.get(`/auth/verify/${token}`);
    },
    async verifyEmailChange(token: string, userId: string) {
        return await api.get(
            `/auth/verify-email-change/${token}?userId=${userId}`,
        );
    },
};

export default authService;
