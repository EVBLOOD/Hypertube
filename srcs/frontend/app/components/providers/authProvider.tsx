"use client";

import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { AxiosError } from "axios";
import { redirect } from "next/dist/client/components/navigation";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);
    const { user, userLogged, reset } = useUserStore();
    const t = useTranslations("Auth");

    useEffect(() => {
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
                    console.debug(
                        "Error fetching user info:",
                        (err as AxiosError).message,
                    );
                    if ((err as AxiosError).response?.status === 401) {
                        console.debug(
                            "Unauthorized, redirecting to login page...",
                        );
                        redirect("/login");
                    }
                    // console.debug(err);
                } finally {
                    setIsReady(true);
                }
            }
        };
        initAuth();
    }, [user, userLogged, reset]);
    if (!isReady) return <div>{t("waiting")}</div>;
    return <>{children}</>;
}
