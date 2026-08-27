"use client";
import Image from "next/image";
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
            <Image height={20} width={20} src={icon} alt={title} />
            <h2>{title}</h2>
        </div>
    );
}
