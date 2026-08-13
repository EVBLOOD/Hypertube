"use client";
import styles from "./titleSectionProfile.module.css";

export default function TitleSectionProfile({
    title,
    icon,
}: {
    title: string;
    icon: string;
}) {
    return (
        <div className={styles.sectionTitle}>
            <img src={icon} alt={title} />
            <h2>{title}</h2>
        </div>
    );
}
