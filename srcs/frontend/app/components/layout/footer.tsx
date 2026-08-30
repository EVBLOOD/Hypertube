"use client";

import { useTranslations } from "next-intl";
import styles from "./footer.module.css";
// import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
    const t = useTranslations("Footer");
    const router = useRouter();

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
                    <span onClick={() => router.push("/docs")}>{t("links.apiDocumentation")}</span>
                </div>
            </div>
        </div>
    );
}
