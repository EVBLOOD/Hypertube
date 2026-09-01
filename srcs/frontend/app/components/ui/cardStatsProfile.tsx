"use client";

import { useTranslations } from "next-intl";
import styles from "./cardStatsProfile.module.css";
import DescriptionComponent from "./descriptionComponent";
import Image from "next/image";

export default function CardStatsProfile({title, count, icon}: {title: string, count: string | number, icon?: string}) {
    const t = useTranslations("Profile");

    return (
        <div className={styles.StatSingleCard}>
            <div className={styles.iconAndCount}>
                <Image height={24} width={24} src={icon || "/costumIcons/play.svg"} alt={t("stats.approvedTitles")} />
                <h2>{count}</h2>
            </div>
            <DescriptionComponent text={title} />
        </div>
    );
}
