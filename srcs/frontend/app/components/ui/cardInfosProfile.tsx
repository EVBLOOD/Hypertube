"use client";

import { useTranslations } from "next-intl";
import styles from "./cardInfosProfile.module.css";
import DescriptionComponent from "./descriptionComponent";

export default function CardInfosProfile() {
    const t = useTranslations("Profile");

    return (
        <div className={styles.cardInfos}>
            <span className={styles.cardTitle}>
                {t("stats.accumulatedExposure")}
            </span>
            <div className={styles.cardMain}>
                <h1>1,428</h1>
                <h2>{t("stats.hours")}</h2>
            </div>
            <DescriptionComponent
                text={t("stats.exposureDescription")}
            ></DescriptionComponent>
        </div>
    );
}
