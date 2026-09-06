"use client";

import HeroSection from "../components/layout/heroSection";
import TrandingSection from "../components/layout/trandingSection";

import { useMovieHero } from "@/lib/dataHooks/moviesHero";
import { useCuratedMovies } from "@/lib/dataHooks/curatedMovies";

import LoadingPage from "../components/layout/loading";
import ErrorPage from "../components/layout/error";
import { AxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getErrorMessage } from "@/lib/helper";
import { toast } from "@/app/components/ui/toast";

import { useContinueWatching } from "@/lib/dataHooks/useContinueWatching";
import { useUserStore } from "@/stores/user";
import ContinueWatchingSection from "../components/layout/continueWatchingSection";

export default function Home() {
    const searchParams = useSearchParams();
    const emailChange = searchParams.get("emailChange");
    const verify = searchParams.get("verify");
    const passwordChange = searchParams.get("passwordChange");
    const passwordReset = searchParams.get("passwordReset");

    const user = useUserStore((state) => state.user);
    const { data: continueWatching } = useContinueWatching(Boolean(user));

    useEffect(() => {
        if (emailChange === "success") {
            toast.success("Email change verified successfully");
        } else if (emailChange === "failed") {
            toast.error("Email change verification failed");
        }
        if (verify === "success") {
            toast.success("Email verified successfully");
        } else if (verify === "failed") {
            toast.error("Email verification failed");
        }
        if (passwordChange === "success") {
            toast.success("Password changed successfully");
        } else if (passwordChange === "failed") {
            toast.error("Password change failed");
        }
        if (passwordReset === "success") {
            toast.success("Password reset successfully");
        } else if (passwordReset === "failed") {
            toast.error("Password reset failed");
        }

    }, [emailChange, verify, passwordChange, passwordReset]);

    const {
        data: hero,
        isPending: hero_pending,
        error: hero_error,
    } = useMovieHero();
    const {
        data: topFour,
        isPending: topFour_pending,
        error: topFour_error,
    } = useCuratedMovies();

    if (hero_pending || topFour_pending) return <LoadingPage />;

    if (hero_error || topFour_error) {
        const heroAxiosError = getErrorMessage(hero_error, topFour_error);

        return (
            <ErrorPage
                errorMessage={heroAxiosError}
                errorCode={
                    (hero_error as AxiosError)?.response?.status ||
                    (topFour_error as AxiosError)?.response?.status ||
                    404
                }
            ></ErrorPage>
        );
    }

    return (
        <div>
            <HeroSection movie={hero?.data} />
            <ContinueWatchingSection movies={user ? continueWatching : undefined} />
            <TrandingSection movies={topFour?.data} />
        </div>
    );
}
