"use client";

import { useQuery } from "@tanstack/react-query";
import UserService from "@/lib/services/UserService";

export const useProfileSummary = () => {
    return useQuery({
        queryKey: ["profile", "summary"],
        queryFn: UserService.getProfileSummary,
    });
};
