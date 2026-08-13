"use client";

import styles from "./titleCustom.module.css";

export default function TitleCustom({
    title,
    nb_color = 1,
    className,
    isMovie = false,
}: {
    title: string;
    nb_color?: number;
    className?: string;
    isMovie?: boolean;
}) {
    const wordsList = title.split(" ");
    const firstWords = wordsList.slice(0, -nb_color).join(" ");
    const lastWord = wordsList.slice(-nb_color).join(" ");

    return (
        <h1
            style={{ fontSize: isMovie ? "small" : "" }}
            className={`${styles.title} ${className ? className : ""}`}
        >
            {" "}
            {firstWords}{" "}
            <span className={styles.titleDefColor}>
                <br /> {lastWord}
            </span>{" "}
        </h1>
    );
}
