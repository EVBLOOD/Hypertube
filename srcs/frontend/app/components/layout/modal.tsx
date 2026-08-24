"use client";

import styles from "./modal.module.css";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function Modal({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthRoute =
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/reset-password") ||
        pathname.includes("/reset-password-email");
    
    const alwaysOpenRoutes =  pathname.includes("/search") && !pathname.includes("/search/users");

    useEffect(() => {
        const currentPath = sessionStorage.getItem("currentPath");
        const isPrevPathAuthRoute =
            currentPath?.includes("/login") ||
            currentPath?.includes("/register") ||
            currentPath?.includes("/reset-password");

        console.log("perv Path:", currentPath);
        console.log("isPrevPathAuthRoute:", isPrevPathAuthRoute);
        console.log("isAuthRoute:", isAuthRoute);

        if (!isAuthRoute && isPrevPathAuthRoute && !alwaysOpenRoutes) {
            console.log("Not an auth route, navigating back");
            router.replace("/");
        }

        sessionStorage.setItem("currentPath", pathname);
    }, [isAuthRoute, pathname, router, alwaysOpenRoutes]);

    if (!isAuthRoute && !alwaysOpenRoutes) {
        return null;
    }

    return (
        <div className={styles.popup} onClick={() => router.back()}>
            <div
                // className={styles.popupDiv}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
