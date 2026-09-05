"use client";

import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { AxiosError } from "axios";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import LoadingPage from "../layout/loading";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const { user, userLogged, reset } = useUserStore();
    const t = useTranslations("Auth");
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // const requiredAuthRoutes =
        //     pathname.includes("/library") ||
        //     pathname.includes("/watchlist") ||
        //     pathname.includes("/profile") ||
        //     pathname.includes("/watch");

        const initAuth = async () => {
            if (user) {
                setIsReady(true);
                return;
            }

            try {
                const fetchedUser = (await AuthService.whois()).data?.user;
                console.debug("User info fetched successfully:", fetchedUser);

                userLogged({
                    username: fetchedUser.username,
                    language: fetchedUser.preferredLanguage,
                    avatar: fetchedUser.profilePicture,
                    isPublic: fetchedUser.isPublic,
                });
                setIsReady(true);
            } catch (err) {
                reset();
                setIsReady(true);

                const axiosError = err as AxiosError;
                console.debug("Error fetching user info:", axiosError.message);

                // if (requiredAuthRoutes) {
                //     console.debug("Unauthorized route accessed, redirecting to login...");
                //     router.push("/login");
                // }
            }
        };

        initAuth();
    }, [pathname, user, userLogged, reset, router]);

    if (!isReady) return <LoadingPage message={t("waiting")} />;

    return <>{children}</>;
}