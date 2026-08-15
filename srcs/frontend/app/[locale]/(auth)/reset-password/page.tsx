"use client";

import LoadingPage from "@/app/components/layout/loading";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/");
        } else {
            router.push(`/reset-password?token=${token}`);
        }
    }, [token, router]);

    if (!token) {
        return null;
    }

    return <LoadingPage />;
}
