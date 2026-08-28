"use client";

import HeroSectionMovie from "@/app/components/layout/heroSectionMovie";
import { use, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import ProdictionAuthorCard from "@/app/components/ui/prodictionAuthorCard";
import CommentInput from "@/app/components/ui/commentInput";
import ViewInteractComment from "@/app/components/ui/viewInteractComment";
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails";
import LoadingPage from "@/app/components/layout/loading";
import type { CommentType } from "@/types/app";
import type { ApiErrorResponse } from "@/types/app";
import MovieService from "@/lib/services/MovieService";
import ErrorPage from "@/app/components/layout/error";
import { AxiosError } from "axios";
import { useMovieComments } from "@/lib/dataHooks/moviesComments";

export default function MoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { data, isPending, error } = useMovieDetails(id);
    const [commentSort, setCommentSort] = useState<string>("createdAt");
    const {
        data: commentsData,
        isPending: commentsPending,
        error: commentsError,
    } = useMovieComments(id, 1, commentSort);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [wishlisted, setWishlisted] = useState(false);
    const [reaction, setReaction] = useState<number>(0);

    const createCommentRef = useRef<HTMLDivElement>(null);
    const interactionCountRef = useRef<HTMLDivElement>(null);

    const sendComment = async (content: string) => {
        try {
            const comment = await MovieService.postComment(id, content);
            const created = comment.data || comment;
            setComments((current) => {
                if (current.some((item) => item.id === created.id))
                    return current;
                return [created, ...current];
            });
            return created;
        } catch (err) {
            console.debug(err);
        }
    };

    const handleSubmitComment = async (content: string) => {
        try {
            const comment = await sendComment(content);
            if (comment) {
                setComments((current) => {
                    if (current.some((item) => item.id === comment.id))
                        return current;
                    return [comment, ...current];
                });
                return;
            }

            const response = await MovieService.postComment(id, content);
            const created = response.data || response;
            setComments((current) => {
                if (current.some((item) => item.id === created.id))
                    return current;
                return [created, ...current];
            });
        } catch (err) {
            console.debug(err);
        }
    };

    const handleLike = async () => {
        try {
            await MovieService.setInteraction({
                queryKey: ["movie", id],
                interaction: 1,
            });
            setReaction(1);
        } catch (err) {
            console.debug(err);
        }
    };

    const handleDislike = async () => {
        try {
            await MovieService.setInteraction({
                queryKey: ["movie", id],
                interaction: 2,
            });
            setReaction(2);
        } catch (err) {
            console.debug(err);
        }
    };

    const handleWishlist = async () => {
        try {
            await MovieService.toggleWishlist(id);
            setWishlisted((value) => !value);
        } catch (err) {
            console.debug(err);
        }
    };

    const handleSort = (sort: string) => {
        if (sort === commentSort) return;
        if (sort !== "createdAt" && sort !== "interactionCount") return;
        setCommentSort(sort);
        createCommentRef.current?.classList.remove(
            styles.commentSelectedFilter,
        );
        interactionCountRef.current?.classList.remove(
            styles.commentSelectedFilter,
        );
        if (sort === "createdAt") {
            createCommentRef.current?.classList.add(
                styles.commentSelectedFilter,
            );
        } else {
            interactionCountRef.current?.classList.add(
                styles.commentSelectedFilter,
            );
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                setComments(commentsData?.data || []);

                if (data && data.data.personnel) {
                    setWishlisted(data.data.personnel.isWishlisted);
                    if (data.data.personnel.liked) setReaction(1);
                    else if (data.data.personnel.disliked) setReaction(2);
                    else setReaction(0);
                }
            } catch (err) {
                console.debug(err);
            }
        };

        void load();
    }, [id, data, commentsData]);

    if (isPending) return <LoadingPage />;
    if (!data || error) {
        const errorMessage =
            (
                (error as AxiosError).response?.data as ApiErrorResponse
            )?.message?.[0] || "Something went wrong";
        const errorCode = (error as AxiosError)?.response?.status || 404;

        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }

    return (
        <div>
            <HeroSectionMovie
                obj={data.data.movie}
                onLike={handleLike}
                onDislike={handleDislike}
                onWishlist={handleWishlist}
                isWishlisted={wishlisted}
                isLiked={reaction === 1}
                isDisliked={reaction === 2}
            />
            <div style={{ backgroundColor: "#131313", paddingBottom: "80px" }}>
                <div className="container">
                    <div className={styles.productionWraper}>
                        <div className={styles.productionLogTitleDeco}></div>
                        <TitleCustom
                            title="PRODUCTION LOGS"
                            nb_color={-2}
                            className={styles.productionLogTitle}
                        />
                    </div>
                    <div className={styles.productionLogElements}>
                        <ProdictionAuthorCard
                            overview={"The director behind the Movie"}
                            name={data.data.director}
                            role="Director"
                        />
                        {data.data.actors.map(
                            (
                                act: { name: string; character: string },
                                index: number,
                            ) => (
                                <ProdictionAuthorCard
                                    key={index}
                                    name={act.name}
                                    role="Actor"
                                    overview={act.character}
                                />
                            ),
                        )}
                    </div>
                </div>
            </div>
            <div className="container">
                <TitleCustom
                    className={styles.commentSectionTitle}
                    title="TRANSMISSIONS"
                    nb_color={-1}
                />
                <div className={styles.commentInfos}>
                    <DescriptionComponent
                        text={`${comments ? comments.length : 0} COMMENT${comments && comments.length !== 1 ? "S" : ""} IN THREAD`}
                    />
                    <div className={styles.commentInfosFilter}>
                        <span
                            onClick={() => {
                                handleSort("createdAt");
                            }}
                            ref={createCommentRef}
                            className={styles.commentSelectedFilter}
                        >
                            LATEST
                        </span>
                        <span
                            onClick={() => {
                                handleSort("interactionCount");
                            }}
                            ref={interactionCountRef}
                        >
                            TOP RATED
                        </span>
                    </div>
                </div>{" "}
                {commentsPending ? (
                    <LoadingPage></LoadingPage>
                ) : commentsError ? (
                    <ErrorPage
                        errorCode={(commentsError as AxiosError).status}
                        errorMessage={
                            (
                                (commentsError as AxiosError).response?.data as
                                    { message: string } | { message: string[] }
                            )?.message?.[0] || "Something went wrong"
                        }
                    />
                ) : (
                    <div>
                        <CommentInput onSubmit={handleSubmitComment} />
                        <div className={styles.viewCommentSection}>
                            {comments.map((comment) => (
                                <ViewInteractComment
                                    key={comment.id}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
