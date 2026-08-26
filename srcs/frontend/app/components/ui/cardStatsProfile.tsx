"use client";

import { useTranslations } from "next-intl";
import styles from "./cardStatsProfile.module.css";
import DescriptionComponent from "./descriptionComponent";

export default function CardStatsProfile() {
    const t = useTranslations("Profile");

    return (
        <div className={styles.StatSingleCard}>
            <img
                src="/costumIcons/play.svg"
                alt={t("stats.approvedTitles")}
                height={"24px"}
                width={"24px"}
            />
            <h2>482</h2>
            <DescriptionComponent
                text={t("stats.approvedTitles")}
            ></DescriptionComponent>
        </div>
    );
}
