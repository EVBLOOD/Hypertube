"use client";

import { useTranslations } from "next-intl";
import styles from "./cardStatsProfile.module.css";
import DescriptionComponent from "./descriptionComponent";
import Image from "next/image";

export default function CardStatsProfile() {
    const t = useTranslations("Profile");

    return (
        <div className={styles.StatSingleCard}>
            <Image
                height={24}
                width={24}
                src="/costumIcons/play.svg"
                alt={t("stats.approvedTitles")}
            />
            <h2>482</h2>
            <DescriptionComponent
                text={t("stats.approvedTitles")}
            ></DescriptionComponent>
        </div>
    );
}
