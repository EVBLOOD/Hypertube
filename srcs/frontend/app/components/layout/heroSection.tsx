"use client";

import { useTranslations } from "use-intl";
import ButtonCustom from "../ui/buttonCustom";
import DescriptionComponent from "../ui/descriptionComponent";
import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";
import styles from "./heroSection.module.css";
import { getResolutionLabel } from "@/lib/helper";
import { useRouter } from "next/navigation";

export default function HeroSection({
    movie,
}: {
    movie: {
        id: number;
        title: string;
        poster: string;
        quality: string;
        standard_audio_format: string;
    };
}) {
    const Home = useTranslations("Home");
    const router = useRouter();
    const resulotion = getResolutionLabel(movie.quality);

    return (
        <div
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 90%),  url('${movie.poster}')`,
            }}
            className={styles.heroSectionWrap}
        >
            <div className={`container ${styles.heroSection}`}>
                <RecordComponent recText={Home("rec")} />
                <div>
                    <TitleCustom
                        title={movie.title}
                        nb_color={
                            (movie.title.split(" ").length == 1
                                ? 0
                                : movie.title.split(" ").length) - 1
                        }
                    />
                    <DescriptionComponent
                        className={styles.heroSectionDescription}
                        text={Home("hero_discription")}
                    />
                </div>
                <div className={styles.heroSectionActions}>
                    <ButtonCustom
                        onClick={() => router.push(`watch/${movie.id}`)}
                        textButton={Home("watch_now")}
                        buttonImage="/costumIcons/play.svg"
                        color="primary"
                    />
                    <ButtonCustom
                        onClick={() => router.push(`movie/${movie.id}`)}
                        textButton={Home("view_more")}
                        buttonImage={undefined}
                        color={null}
                        style={{
                            border: "var(--popup-background-second) 1px solid",
                        }}
                    />
                </div>
                {resulotion ? (
                    <div className={styles.heroSectionInfos}>
                        <div>
                            <p>{Home("resolution")}</p>
                            <p style={{ color: "var(--primary-color)" }}>
                                {" "}
                                {resulotion}
                            </p>
                        </div>

                        <div>
                            <p>{Home("codec")}</p>
                            <p>{movie.standard_audio_format}</p>
                        </div>
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
