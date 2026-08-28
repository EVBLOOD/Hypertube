"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { useInView } from "react-intersection-observer";
import React, { useEffect } from "react";
import type { UserSearchType } from "@/types/app";
import LoadingPage from "@/app/components/layout/loading";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import ScrollLoading from "@/app/components/ui/scrollLoading";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import { useUsersList } from "@/lib/dataHooks/UsersList";
import { useParams } from "next/navigation";
import UserSearchCard from "@/app/components/ui/userSearchCard";
import { getErrorMessage } from "@/lib/helper";

export default function SearchUsers() {
    const Library = useTranslations("Library");
    const { ref: viewRef, inView } = useInView({ threshold: 0.1 });

    const username = useParams().id as string;
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isPending,
        error,
    } = useUsersList(username);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const errorMessage = getErrorMessage(error);
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
                        {page?.data?.map((user: UserSearchType) => (
                            <UserSearchCard
                                key={user.id}
                                user={user}
                            ></UserSearchCard>
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
