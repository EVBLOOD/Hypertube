import api from "@/lib/api";
import type {
    AvatarUpdateResponse,
    ProfileSummary,
    ProfileUpdateResponse,
    UpdateUserPayload,
} from "@/types/app";

const userService = {
    async getProfileSummary() {
        return (await api.get<ProfileSummary>("/users/me/summary")).data;
    },

    async updateMe(payload: UpdateUserPayload) {
        return (await api.patch<ProfileUpdateResponse>("/users/me", payload))
            .data;
    },
    async getUserList({
        pageParam = 1,
        username,
    }: {
        pageParam: number;
        queryKey: string[];
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
            await api.post<AvatarUpdateResponse>(`/users/avatar_update`, file, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
        ).data;
    },
    async getProfileSummaryById(id: string) {
        return (await api.get<ProfileSummary>(`/users/${id}/summary`)).data;
    }
};

export default userService;
