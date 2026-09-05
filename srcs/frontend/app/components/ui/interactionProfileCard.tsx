"use client";

import { useTranslations } from "next-intl";
import DescriptionComponent from "./descriptionComponent";
import styles from "./interactionProfileCard.module.css";
import { formatDistance } from "date-fns";
import Image from "next/image";
import type { ProfileHistoryItem } from "@/types/app";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InteractionProfileCard({
    movie,
}: {
    movie?: ProfileHistoryItem;
}) {
    const t = useTranslations("Profile");
    const History = useTranslations("History.stats");
    const router = useRouter();

    const getInteractionTime = (actionDate: string | Date) => {
        const timeAgo = formatDistance(new Date(actionDate), new Date(), {
            addSuffix: true,
        });
        return timeAgo;
    };

    const mapActionsToIcons = (action: string) => {
        switch (action) {
            case "watched":
                return "/costumIcons/movie-film.svg";
            case "added_to_wishlist":
                return "/costumIcons/bookmark.svg";
            case "removed_from_wishlist":
                return "/costumIcons/bookmark.svg";
            case "liked":
                return "/costumIcons/like.svg";
            case "disliked":
                return "/costumIcons/dislike.svg";
            default:
                return "/costumIcons/recent.svg";
        }
    };

    const getActionDescription = (action: string) => {
        switch (action) {
            case "watched":
                return History("watched");
            case "added_to_wishlist":
                return History("addedToWishlist");
            case "removed_from_wishlist":
                return History("removedFromWishlist");
            case "liked":
                return History("liked");
            case "disliked":
                return History("disliked");
            default:
                return History("unknownAction");
        }
    }

    const interactionIcon = movie?.action
        ? mapActionsToIcons(movie.action)
        : "/costumIcons/play.svg";
    const interactionTime = movie?.actionDate
        ? getInteractionTime(movie.actionDate)
        : t("stats.unknownTime");

    const moviePoster = movie?.poster || "/default-poster.png";

    const handleCardClick = () => {
        const movieId = movie ? (movie as { id?: string | number }).id : undefined;
        if (movie && movieId) {
            router.push(`movie/${movieId}`);
        }
    }

    return (
        <div className={styles.cardBody} onClick={handleCardClick}>
            <div className={styles.coverTitleInfo}>
                {/* <Image
                    height={64}
                    width={48}
                    src={moviePoster}
                    alt={t("stats.moviePoster")}
                /> */}
                <img className={styles.moviePoster} src={moviePoster} alt={t("stats.moviePoster")} />
                <div className={styles.infos}>
                    <div className={styles.titleAndTime}>
                        <h3 className={styles.movieTitle}>
                            {movie?.title?.slice(0, 20) +
                                (movie?.title?.length && movie?.title?.length > 20
                                    ? "..."
                                    : "") || t("stats.unknownTitle")}
                            {' '}
                            <span className={styles.status}>
                                {getActionDescription(movie?.action || "")}
                            </span>
                        </h3>
                        <div className={styles.interactionInfos}>
                            <Image height={15} width={15} src={interactionIcon} alt={t("stats.interactionIcon")}/>
                            <p>{interactionTime}</p>
                        </div>
                    </div>
                    <DescriptionComponent
                        className={styles.discreptionMarginCorrection}
                        text={
                            movie?.overview?.slice(0, 100) + "..." ||
                            t("stats.unknownOverview")
                        }
                    />
                </div>
            </div>
        </div>
    );
}
