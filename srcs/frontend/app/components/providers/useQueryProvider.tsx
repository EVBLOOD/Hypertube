"use client";

import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

export default function UseQueryProvider({
    children,
}: {
    children: ReactNode;
}) {
    // const [queryClient] = useState(() => new QueryClient());
    const router = useRouter();
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error: Error) => {
                        console.debug("Query error:", error);
                        if (axios.isAxiosError(error)) {
                            const status = error.response?.status;
                            if (status === 401) {
                                router.push("/login");
                            }
                        }
                    },
                }),

                mutationCache: new MutationCache({
                    onError: (error: Error) => {
                        console.debug("Mutation error:", error);
                        if (axios.isAxiosError(error)) {
                            const status = error.response?.status;
                            if (status === 401) {
                                router.push("/login");
                            }
                        }
                    },
                }),

                defaultOptions: {
                    queries: {
                        retry: (failureCount, error: Error) => {
                            console.debug("Query error:", error);
                            if (axios.isAxiosError(error)) {
                                const status = error.response?.status;
                                if (status === 401) {
                                    return false;
                                }
                            }
                            return failureCount < 3;
                        },
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
