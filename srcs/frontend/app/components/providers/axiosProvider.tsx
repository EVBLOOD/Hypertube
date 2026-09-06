"use client";
import api from "@/lib/api";
import { useUserStore } from "@/stores/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AxiosProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    useUserStore.getState().reset();
                    if (typeof window !== "undefined") {
                        if (
                            error?.config?.url !== "/auth/whois" &&
                            error?.config?.url !== "/auth/login"
                        ) {
                            router.push("/login");
                        }
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    })

    return (
        <>{children}</>
    );
}