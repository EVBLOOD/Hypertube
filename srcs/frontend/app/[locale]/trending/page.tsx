"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { useInView } from "react-intersection-observer";
import React, { useEffect } from "react";
import { useTrendings } from "@/lib/dataHooks/trendingList";
import type { MovieType } from "@/types/app";
import MovieCard from "@/app/components/ui/movieCard";
import LoadingPage from "@/app/components/layout/loading";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import ScrollLoading from "@/app/components/ui/scrollLoading";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";

export default function Trending() {
    const Library = useTranslations("Library");

    const { ref: viewRef, inView } = useInView({ threshold: 0.1 });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        error,
    } = useTrendings();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const errorMessage =
            (
                (error as AxiosError).response?.data as
                    { message: string } | { message: string[] }
            )?.message?.[0] || "Something went wrong";
        const errorCode = (error as AxiosError)?.response?.status || 404;

        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }
    return (
        <div className={`container ${styles.browseContent}`}>
            <div className={styles.mainBrowseContentHead}>
                <div>
                    <TitleCustom title={Library("title")} nb_color={-2} />
                    <DescriptionComponent text={Library("sub_title")} />
                </div>
            </div>
            <div className={`${styles.moviesList}`}>
                {data?.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page?.data?.map((movie: MovieType) => (
                            <MovieCard key={movie.id} movie={movie}></MovieCard>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <div ref={viewRef} style={{ height: "40px" }}>
                {isFetchingNextPage ? <ScrollLoading /> : ""}
            </div>
        </div>
    );
}
