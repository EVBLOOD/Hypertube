"use client";

import { useTranslations } from "next-intl";
import DescriptionComponent from "./descriptionComponent";
import styles from "./interactionProfileCard.module.css";
import { formatDistance } from "date-fns";

export default function InteractionProfileCard({
    movie,
}: {
    movie?: {
        title: string;
        overview: string;
        quality: string;
        action: string;
        actionDate: Date;
        poster: string;
    };
}) {
    const t = useTranslations("Profile");
    console.log("movie", movie);

    const getInteractionTime = (actionDate: Date) => {
        const timeAgo = formatDistance(new Date(actionDate), new Date(), {
            addSuffix: true,
        });
        return timeAgo;
    };

    const mapActionsToIcons = (action: string) => {
        switch (action) {
            case "watched":
                return "/costumIcons/play.svg";
            case "wishlisted":
                return "/costumIcons/watchLater.svg";
            case "liked":
                return "/costumIcons/likeMovie.svg";
            case "disliked":
                return "/costumIcons/dislikeMovie.svg";
            default:
                return "/costumIcons/recent.svg";
        }
    };

    const interactionIcon = movie?.action
        ? mapActionsToIcons(movie.action)
        : "/costumIcons/play.svg";
    const interactionTime = movie?.actionDate
        ? getInteractionTime(movie.actionDate)
        : t("stats.unknownTime");

    return (
        <div className={styles.cardBody}>
            <div className={styles.coverTitleInfo}>
                <img
                    src={movie?.poster || "/hero.png"}
                    alt={t("stats.moviePoster")}
                    width={"48px"}
                    height={"64px"}
                />
                <div>
                    <h3 className={styles.movieTitle}>
                        {movie?.title?.slice(0, 20) +
                            (movie?.title?.length && movie?.title?.length > 20
                                ? "..."
                                : "") || t("stats.unknownTitle")}
                    </h3>
                    <DescriptionComponent
                        className={styles.discreptionMarginCorrection}
                        text={
                            movie?.overview?.slice(0, 100) + "..." ||
                            t("stats.unknownOverview")
                        }
                    />
                </div>
            </div>
            <div className={styles.interactionInofs}>
                <img src={interactionIcon} alt={t("stats.interactionIcon")} />
                <DescriptionComponent
                    className={styles.discreptionMarginCorrection}
                    text={interactionTime}
                />
            </div>
        </div>
    );
}
