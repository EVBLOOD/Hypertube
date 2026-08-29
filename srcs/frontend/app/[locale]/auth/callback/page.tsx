"use client";

import LoadingPage from "@/app/components/layout/loading";
import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { useEffect } from "react";

export default function AuthCallbackPage() {
    useEffect(() => {

        const finishAuth = async () => {

            try {
                let user = null;

                try {
                    user = (await AuthService.whois()).data;

                    useUserStore.getState().userLogged({
                        username: user.username,
                        language: user.preferredLanguage,
                        avatar: user.profilePicture,
                        isPublic: user.isPublic,
                    });
                } catch (err) {
                    console.debug(err);
                }
                const authChannel = new BroadcastChannel("auth_channel");

                if (!user) {
                    authChannel.postMessage({ type: "login_failure" });
                } else {
                    authChannel.postMessage({
                        type: "login_success",
                        user: user
                    });
                }

                authChannel.close();

                // if (window.opener) {
                //     console.debug("Sending login success message to opener window:", { type: "login_success", user });
                //     window.opener.postMessage(
                //         { type: "login_success", user },
                //         window.location.origin,
                //     );
                // }

            } catch (error) {
                console.debug("Error during auth callback:", error);
            } finally {
                window.close();
            }
        };

        finishAuth();
    }, []);

    return <LoadingPage />;
}