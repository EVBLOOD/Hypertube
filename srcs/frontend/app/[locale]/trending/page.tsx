"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { useInView } from "react-intersection-observer";
import React, { useEffect } from "react";
import { useTrendings } from "@/lib/dataHooks/trendingList";
import { MovieType } from "@/types/apiTypes";
import MovieCard from "@/app/components/ui/movieCard";
import LoadingPage from "@/app/components/layout/loading";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import ScrollLoading from "@/app/components/ui/scrollLoading";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";

export default function Trending() {
    const Trending = useTranslations("Trending");
    const Library = useTranslations("Library");

    const { ref: viewRef, inView } = useInView({ threshold: 0.1 });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        isPending,
        error,
    } = useTrendings();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView]);
    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const axiosErr = error as AxiosError<any>;
        const errorMessage =
            axiosErr.response?.data?.message || "Something went wrong";
        const errorCode = axiosErr?.response?.status || 404;
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
