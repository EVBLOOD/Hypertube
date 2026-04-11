'use client';

import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { ReactNode, useEffect, useState } from "react";

export default function AuthProvider({children}: {children: ReactNode}) {
    const [isReady, setIsReady] = useState(false);
    const {user, userLogged, reset} = useUserStore();

    const initAuth = async () => {
        if (!user) {
            try {
                const user = (await AuthService.whois()).data?.user
                userLogged({username: user.username, language: user.preferredLanguage, avatar: user.profilePicture})
            } catch(err) {
                reset()
                console.log(err)
            } finally {
                setIsReady(true)
            }
        }
    }
    useEffect(() => {
        initAuth()
    }, [user, userLogged])
    if (!isReady) return <div>Waiting for Auth..</div>
    return <>{children}</>
}