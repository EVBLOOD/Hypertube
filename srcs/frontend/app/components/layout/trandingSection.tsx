"use client";

import { useTranslations } from "use-intl";
import CardElementHighlight from "../ui/cardElementHighlight";
import styles from "./trandingSection.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { TrendingMovie } from "@/types/app";

export default function TrandingSection({
    movies,
}: {
    movies: TrendingMovie[];
}) {
    const Home = useTranslations("Home");
    const router = useRouter();

    return (
        <div className={`container ${styles.trandingSectionParent}`}>
            <div className={styles.tradingHeader}>
                <div>
                    <h1 style={{ marginBottom: 0 }}>{Home("tranding")}</h1>
                    <span className={styles.subTitleTranding}>
                        {Home("selection")}
                    </span>
                </div>
                <div
                    className={styles.tradingViewMore}
                    onClick={() => router.push("/trending")}
                >
                    <p>{Home("see_all")}</p>
                    <Image
                        height={20}
                        width={20}
                        src="/costumIcons/go_in.svg"
                        alt={Home("see_all")}
                    />
                </div>
            </div>
            <div className={styles.trandingSection}>
                {movies[0] && <CardElementHighlight
                    movie={movies[0]}
                    className={styles.mainTrand}
                />}
                {movies[1] && <CardElementHighlight
                    movie={movies[1]}
                    classNameTitle={styles.smallerTitle}
                    className={styles.subtrand}
                    yeExtra={false}
                />}
                {movies[2] && <CardElementHighlight
                    movie={movies[2]}
                    classNameTitle={styles.smallerTitle}
                    className={styles.subtrand}
                    yeExtra={false}
                />}
                {movies[3] && <CardElementHighlight
                    movie={movies[3]}
                    classNameTitle={styles.smallTitle}
                    className={`${styles.subcollection} ${styles.collectionElement}`}
                    yeIfos={false}
                />}
            </div>
        </div>
    );
}
