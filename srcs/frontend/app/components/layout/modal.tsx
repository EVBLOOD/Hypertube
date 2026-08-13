"use client";

import styles from "./modal.module.css";
import { redirect, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function Modal({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthRoute =
        pathname.includes("/login") || pathname.includes("/register");

    useEffect(() => {
        if (!isAuthRoute) {
            router.replace("/");
        }
    }, [isAuthRoute, pathname, router]);

    if (!isAuthRoute) {
        return null;
    }

    return (
        <div className={styles.popup} onClick={() => router.back()}>
            <div
                className={styles.popupDiv}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
