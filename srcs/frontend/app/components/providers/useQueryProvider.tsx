"use client";

import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
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
                    onError: (error: any) => {
                        const status = error?.response?.status;
                        if (status === 401) {
                            router.push("/login");
                        }
                    },
                }),

                mutationCache: new MutationCache({
                    onError: (error: any) => {
                        const status = error?.response?.status;
                        if (status === 401) {
                            router.push("/login");
                        }
                    },
                }),

                defaultOptions: {
                    queries: {
                        retry: (failureCount, error: any) => {
                            if (error?.response?.status === 401) return false;
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
