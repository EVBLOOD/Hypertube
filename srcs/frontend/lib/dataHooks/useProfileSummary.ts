"use client";

import { useQuery } from "@tanstack/react-query";
import UserService from "@/lib/services/UserService";
import type { ProfileSummary } from "@/types/app";

export const useProfileSummary = () => {
    return useQuery<ProfileSummary>({
        queryKey: ["profile", "summary"],
        queryFn: UserService.getProfileSummary,
    });
};
