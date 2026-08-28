"use client";

import ButtonCustom from "./buttonCustom";
import DescriptionComponent from "./descriptionComponent";
import styles from "./viewInteractComment.module.css";
import type { CommentType } from "@/types/app";
import { formatDistance } from "date-fns";
import MovieService from "@/lib/services/MovieService";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function ViewInteractComment({
    comment,
}: {
    comment: CommentType;
}) {
    const author = comment.user?.username || comment.user?.firstName || "USER";
    const timeAgo = formatDistance(new Date(comment.createdAt), new Date(), {
        addSuffix: true,
    });
    const likeRef = useRef<HTMLImageElement>(null);
    const dislikeRef = useRef<HTMLImageElement>(null);

    const [likeCount, setLikeCount] = useState<number>(comment.likeCount);
    const [dislikeCount, setDislikeCount] = useState<number>(
        comment.dislikeCount,
    );

    const handleLike = async () => {
        try {
            const result = await MovieService.addCommentInteraction(
                comment.id,
                1,
            );
            if (result && result.data) {
                console.debug(result);

                if (result.data.likeCount > likeCount) {
                    likeRef.current?.style.setProperty("filter", "");
                    dislikeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                } else if (result.data.likeCount < likeCount) {
                    likeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                    dislikeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                }
                setLikeCount(result.data.likeCount);
                setDislikeCount(result.data.dislikeCount);
            }
        } catch (err) {
            console.debug("Error liking comment:", err);
        }
    };

    const handleDislike = async () => {
        try {
            const result = await MovieService.addCommentInteraction(
                comment.id,
                2,
            );
            if (result && result.data) {
                console.debug(result);

                if (result.data.dislikeCount > dislikeCount) {
                    likeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                    dislikeRef.current?.style.setProperty("filter", "");
                } else if (result.data.dislikeCount < dislikeCount) {
                    likeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                    dislikeRef.current?.style.setProperty(
                        "filter",
                        "brightness(0.253)",
                    );
                }
                setLikeCount(result.data.likeCount);
                setDislikeCount(result.data.dislikeCount);
            }
        } catch (err) {
            console.debug("Error disliking comment:", err);
        }
    };

    useEffect(() => {
        if (comment.userReaction === 1) {
            likeRef.current?.style.setProperty("filter", "");
            dislikeRef.current?.style.setProperty(
                "filter",
                "brightness(0.253)",
            );
        } else if (comment.userReaction === 2) {
            likeRef.current?.style.setProperty("filter", "brightness(0.253)");
            dislikeRef.current?.style.setProperty("filter", "");
        } else {
            likeRef.current?.style.setProperty("filter", "brightness(0.253)");
            dislikeRef.current?.style.setProperty(
                "filter",
                "brightness(0.253)",
            );
        }
    }, [comment.userReaction]);

    return (
        <div className={styles.commentViewing}>
            <Image
                height={20}
                width={46}
                className={styles.commentViewingAvatar}
                src="/hero.png"
                alt="avatar"
            />
            <div>
                <div className={styles.commentorInfos}>
                    <h4>{author}</h4>
                    <DescriptionComponent text={timeAgo} />
                </div>
                <p className={styles.textCommentView}>{comment.content}</p>
                <div className={styles.commentIntersction}>
                    <ButtonCustom
                        refImage={likeRef}
                        style={{ backgroundColor: "transparent" }}
                        buttonImage="/costumIcons/likeMovie.svg"
                        textButton={likeCount.toString()}
                        onClick={handleLike}
                    />
                    <ButtonCustom
                        refImage={dislikeRef}
                        style={{ backgroundColor: "transparent" }}
                        buttonImage="/costumIcons/dislikeMovie.svg"
                        textButton={dislikeCount.toString()}
                        onClick={handleDislike}
                    />
                    {/* <ButtonCustom
                        buttonImage={undefined}
                        textButton={t("reply")}
                    /> */}
                </div>
            </div>
        </div>
    );
}
