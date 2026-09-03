"use client";

import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { AxiosError } from "axios";
import { redirect, usePathname } from "next/dist/client/components/navigation";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import path from "path";
import LoadingPage from "../layout/loading";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const { user, userLogged, reset } = useUserStore();
    const t = useTranslations("Auth");
    const pathname = usePathname();

    useEffect(() => {
        const requiredAuthRoutes = pathname.includes("/library") || pathname.includes("/watchlist") || pathname.includes("/profile") || pathname.includes("/watch");
        const initAuth = async () => {
            if (!user) {
                try {
                    const user = (await AuthService.whois()).data?.user;
                    console.debug("User info fetched successfully:", user);
                    userLogged({
                        username: user.username,
                        language: user.preferredLanguage,
                        avatar: user.profilePicture,
                        isPublic: user.isPublic,
                    });
                } catch (err) {
                    reset();
                    setIsReady(true);

                    console.debug(
                        "Error fetching user info:",
                        (err as AxiosError).message,
                    );
                    if ((err as AxiosError).response?.status === 401 && requiredAuthRoutes) {
                        console.debug(
                            "Unauthorized, redirecting to login page...",
                        );
                        redirect("/login");
                    } else {
                        console.debug(`Error fetching user info: ${(err as AxiosError).message}, error code: ${(err as AxiosError).response?.status}, redirecting to login page...`);
                        redirect("/login");
                    }
                } finally {
                    setIsReady(true);
                }
            }
        };
        initAuth();
    }, [user, userLogged, reset]);
    if (!isReady) return <LoadingPage message={t("waiting")} />;
    return <>{children}</>;
}
