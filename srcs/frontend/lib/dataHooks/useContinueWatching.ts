"use client";

import { useQuery } from "@tanstack/react-query";
import UserService from "@/lib/services/UserService";

export const useContinueWatching = (enabled: boolean) => {
    return useQuery({
        queryKey: ["profile", "continue-watching"],
        queryFn: UserService.getContinueWatching,
        enabled,
        staleTime: 1000 * 60 * 5,
    });
};