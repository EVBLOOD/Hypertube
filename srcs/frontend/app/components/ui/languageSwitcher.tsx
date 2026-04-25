"use client";

import { useState, useEffect } from "react";
import styles from './languageSwitcher.module.css'

export default function LanguageSwitcher({ local }: { local: string }) {
    const [isAtTop, setIsAtTop] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [choose, setChoice] = useState(local);
    const langs = ["EN", "FR", "AR"]


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
        return <></>
    }

    return (
        // <>
            <div className={!isOpen ? styles.languageStyle : styles.languageStyleOpen}>
                <div onClick={() => setIsOpen(!isOpen)} className={styles.languageStyleOverView}>
                    <img src="/costumIcons/play.svg" alt="lang" />
                    <span>{choose.toUpperCase()}</span>
                </div>
                <ul style={{ display: isOpen ? 'flex' : 'none' }} className={styles.languageChoices}>
                    {langs.filter(e => e != local.toUpperCase()).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        // </>
    );
}