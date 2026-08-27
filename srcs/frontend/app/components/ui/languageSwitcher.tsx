"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import styles from "./languageSwitcher.module.css";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function LanguageSwitcher({ local }: { local: string }) {
    const t = useTranslations("Language");
    const [isAtTop, setIsAtTop] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [choose, setChoice] = useState(local);

    const router = useRouter();
    const pathname = usePathname();

    const langs = ["EN", "FR", "AR"];

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY < 50;
            setIsAtTop(scrolled);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isAtTop) {
        return <></>;
    }

    return (
        // <>
        <div
            className={
                !isOpen ? styles.languageStyle : styles.languageStyleOpen
            }
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={styles.languageStyleOverView}
                aria-label={t("ariaLabel")}
            >
                <Image
                    height={15}
                    width={15}
                    src="/costumIcons/play.svg"
                    alt={t("ariaLabel")}
                />
                <span>{choose.toUpperCase()}</span>
            </div>
            <ul
                style={{ display: isOpen ? "flex" : "none" }}
                className={styles.languageChoices}
            >
                {langs
                    .filter((e) => e != local.toUpperCase())
                    .map((e, i) => (
                        <li
                            key={i}
                            onClick={() => {
                                document.cookie = `NEXT_LOCALE=${e.toLowerCase()}; path=/; max-age=31536000`;
                                router.push(
                                    `/${e.toLowerCase()}/${pathname.slice(4)}`,
                                );
                                setChoice(e.toLowerCase());
                            }}
                        >
                            {e}
                        </li>
                    ))}
            </ul>
        </div>
        // </>
    );
}
