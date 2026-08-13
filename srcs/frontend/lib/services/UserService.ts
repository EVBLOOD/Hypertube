import api from "@/lib/api";
import type { Register } from "@/types/apiTypes";

export type UpdateUserPayload = {
    // firstName?: string;
    // lastName?: string;
    email?: string;
    username?: string;
    preferredLanguage?: "en" | "fr" | "ar";
    privacy?: "public" | "private";
};

export default {
    async getProfileSummary() {
        return (await api.get("/users/me/summary")).data;
    },

    async updateMe(payload: UpdateUserPayload) {
        return (await api.patch("/users/me", payload)).data;
    },
};
