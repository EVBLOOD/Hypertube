"use client";

import Link from "next/link";
import styles from "./buttonCustom.module.css";
import type { CSSProperties, MouseEventHandler } from "react";

export default function ButtonCustom({
    textButton,
    buttonImage,
    color,
    style,
    className,
    href,
    onClick,
}: {
    textButton: string;
    buttonImage: string | undefined;
    color?: string | null;
    style?: CSSProperties;
    className?: string;
    href?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
    const buttonStyles: CSSProperties = {
        backgroundColor:
            textButton.length > 0 && color
                ? "var(--primary-color)"
                : textButton.length > 0 && color !== null
                  ? "var(--popup-background-second)"
                  : "",
        color: !color
            ? "var(--font-color-white)"
            : "var(--popup-background-second)",
        ...style,
    };

    const imageFilterStyle: CSSProperties = {
        filter:
            textButton.length > 0 && color
                ? "brightness(0.253)"
                : color
                  ? ""
                  : !color && textButton.length > 0
                    ? ""
                    : "brightness(0.253)",
    };

    return !href ? (
        <button
            onClick={onClick}
            className={`${styles.button} ${className ? className : ""}`}
            style={buttonStyles}
        >
            {buttonImage ? (
                <img
                    className={styles.buttonImage}
                    src={buttonImage}
                    alt={textButton}
                    style={imageFilterStyle}
                />
            ) : (
                ""
            )}
            {textButton}
        </button>
    ) : (
        <Link
            href={href}
            scroll={false}
            className={`${styles.button} ${className ? className : ""}`}
            style={buttonStyles}
        >
            {buttonImage ? (
                <img
                    className={styles.buttonImage}
                    src={buttonImage}
                    alt={textButton}
                    style={imageFilterStyle}
                />
            ) : (
                ""
            )}
            {textButton}
        </Link>
    );
}
