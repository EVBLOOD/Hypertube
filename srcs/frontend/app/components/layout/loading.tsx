"use client";

import { useTranslations } from "next-intl";
import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";

import styles from "./loading.module.css";

export default function LoadingPage({ message }: { message?: string }) {
    const t = useTranslations("Common");
    const defaultMessage = message || t("status.loading");

    return (
        <div className={styles.pandingPage}>
            <RecordComponent
                className={styles.recSizeChange}
                recText=""
            ></RecordComponent>
            <TitleCustom
                className={styles.titleJust}
                title={defaultMessage}
            ></TitleCustom>
            <div className={styles.loadingBar}></div>
        </div>
    );
}
