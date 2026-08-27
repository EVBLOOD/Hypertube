import api from "@/lib/api";

export type UpdateUserPayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    preferredLanguage?: "en" | "fr" | "ar";
    privacy?: "public" | "private";
};

const userService = {
    async getProfileSummary() {
        return (await api.get("/users/me/summary")).data;
    },

    async updateMe(payload: UpdateUserPayload) {
        return (await api.patch("/users/me", payload)).data;
    },
    async getUserList({
        pageParam = 1,
        username,
    }: {
        pageParam: number;
        queryKey: any;
        username: string;
    }) {
        return (
            await api.get("/users/find/users", {
                params: {
                    page: pageParam,
                    limit: 20,
                    username: username,
                },
            })
        ).data;
    },
    async UpdateUserAvatar(file: FormData) {
        return (
            await api.post(`/users/avatar_update`, file, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        ).data;
    },
};

export default userService;
