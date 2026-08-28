"use client";

import { useTranslations } from "next-intl";
import styles from "./scrollLoading.module.css";

export default function ScrollLoading() {
    const t = useTranslations("Common");

    return (
        <div className={styles.containerLoading}>
            <div className={styles.spiner}></div>
            <div className={styles.loadingText}>
                {t("status.loadingNextPage")}
            </div>
        </div>
    );
}
