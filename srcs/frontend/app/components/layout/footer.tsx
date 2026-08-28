"use client";

import { useTranslations } from "next-intl";
import styles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
    const t = useTranslations("Footer");

    return (
        <div
            className={styles.footerAll}
            style={{ backgroundColor: "var(--popup-background)" }}
        >
            <div className={`container ${styles.borderWrap}`}>
                <span className={styles.logo}>{t("brand")}</span>
                <span>{t("rights")}</span>
                <div className={styles.borderInfos}>
                    <span>{t("links.technicalSpecs")}</span>
                    <span>{t("links.privacyProtocol")}</span>
                    <span>{t("links.apiDocumentation")}</span>
                </div>
            </div>
        </div>
    );
}
