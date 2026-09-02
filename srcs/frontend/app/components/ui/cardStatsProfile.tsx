"use client";

import { useTranslations } from "next-intl";
import styles from "./cardStatsProfile.module.css";
import DescriptionComponent from "./descriptionComponent";
import Image from "next/image";
import { useRouter } from "next/dist/client/components/navigation";

export default function CardStatsProfile({title, count, icon, href}: {title: string, count: string | number, icon?: string, href?: string}) {
    const t = useTranslations("Profile");
    const router = useRouter();

    const handleCardClick = () => {
        if (href) {
            router.push(href);
        }
    };

    return (
        <div className={styles.StatSingleCard} onClick={handleCardClick}>
            <div className={styles.iconAndCount}>
                <Image height={24} width={24} src={icon || "/costumIcons/play.svg"} alt={t("stats.approvedTitles")} />
                <h2>{count}</h2>
            </div>
            <DescriptionComponent text={title} />
        </div>
    );
}
