import { useInfiniteQuery } from "@tanstack/react-query";
import UserService from "../services/UserService";

export const useUsersList = (username: string) => {
    return useInfiniteQuery({
        queryKey: ["user", "list", username],
        queryFn: (params) => UserService.getUserList({ ...params, username }),
        initialPageParam: 1,
        getNextPageParam: (lst) =>
            lst.metadata.hasMore ? lst.metadata.nextPage : undefined,
    });
};
