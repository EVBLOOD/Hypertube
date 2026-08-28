"use client";

import { useTranslations } from "next-intl";
import ButtonCustom from "./buttonCustom";
import DescriptionComponent from "./descriptionComponent";
import styles from "./movieCard.module.css";
import TitleCustom from "./titleCustom";
import type { MovieType } from "@/types/app";
import { useRouter } from "next/navigation";

export default function MovieCard({ movie }: { movie: MovieType }) {
    const Library = useTranslations("Library");
    const router = useRouter();

    const isWatched = (currentSeconds: number, durationInMinutes: number) => {
        const totalSeconds = durationInMinutes * 60;
        if (totalSeconds <= 0) return false;

        if ((currentSeconds / totalSeconds) * 100 >= 85) {
            return true;
        }
        return false;
    };

    return (
        <div
            onClick={() => router.push(`/movie/${movie.id}`)}
            className={styles.bodyCard}
        >
            <div
                style={{ backgroundImage: `url(${movie.poster})` }}
                className={styles.cardImage}
            >
                <div className={styles.seenWrapper}>
                    {movie.lastWatchedTime > 0 ? (
                        <ButtonCustom
                            textButton={
                                isWatched(
                                    movie.lastWatchedTime,
                                    movie.totalMinutes,
                                )
                                    ? Library("seen")
                                    : Library("continue")
                            }
                            buttonImage="/costumIcons/play.svg"
                            color="primary"
                            className={styles.wasSeen}
                        />
                    ) : (
                        ""
                    )}
                </div>

                <div className={styles.infosWraper}>
                    <ButtonCustom
                        className={styles.infoStyle}
                        textButton={movie.quality}
                        buttonImage={undefined}
                    />
                    <ButtonCustom
                        className={styles.infoStyle}
                        textButton={movie.standard_audio_format}
                        buttonImage={undefined}
                    />
                </div>
            </div>
            <div className={styles.titleRatingWraper}>
                <TitleCustom
                    isMovie={true}
                    title={movie.title}
                    nb_color={-movie.title.length}
                ></TitleCustom>
                <span>{movie.rating}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <DescriptionComponent
                    text={`${movie.year}`}
                ></DescriptionComponent>
                <DescriptionComponent
                    text={`${movie.genres?.length ? movie.genres[0] : movie.genres}`}
                ></DescriptionComponent>
            </div>
        </div>
    );
}
