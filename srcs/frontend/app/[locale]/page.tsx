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

export default function Home() {
    const searchParams = useSearchParams();
    const emailChange = searchParams.get("emailChange");
    const verify = searchParams.get("verify");
    const passwordChange = searchParams.get("passwordChange");
    const passwordReset = searchParams.get("passwordReset");
    useEffect(() => {
        if (emailChange === "success") {
            alert("Email change verified successfully");
        } else if (emailChange === "failed") {
            alert("Email change verification failed");
        }
        if (verify === "success") {
            alert("Email verified successfully");
        } else if (verify === "failed") {
            alert("Email verification failed");
        }
        if (passwordChange === "success") {
            alert("Password changed successfully");
        } else if (passwordChange === "failed") {
            alert("Password change failed");
        }
        if (passwordReset === "success") {
            alert("Password reset successfully");
        } else if (passwordReset === "failed") {
            alert("Password reset failed");
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
            <TrandingSection movies={topFour?.data} />
        </div>
    );
}
