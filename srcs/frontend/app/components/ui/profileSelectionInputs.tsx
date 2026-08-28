"use client";

import { useEffect, useRef } from "react";
import DescriptionComponent from "./descriptionComponent";
import styles from "./profileSelectionInputs.module.css";

export default function ProfileSelectionInputs({
    title,
    description,
    type,
    init,
    setter,
}: {
    title: string;
    description: string;
    type?: string;
    init: string;
    setter?:
        | React.Dispatch<React.SetStateAction<"en" | "ar" | "fr">>
        | React.Dispatch<React.SetStateAction<"public" | "private">>;
}) {
    const refrenceOn = useRef<HTMLInputElement>(null);
    const refrenceOff = useRef<HTMLInputElement>(null);

    function isVisibilitySetter(
        setter: unknown,
    ): setter is React.Dispatch<React.SetStateAction<"public" | "private">> {
        return typeof setter === "function";
    }
    function isLanguageSetter(
        setter: unknown,
    ): setter is React.Dispatch<React.SetStateAction<"en" | "ar" | "fr">> {
        return typeof setter === "function";
    }

    const handleNonLanguageChange = (id: string) => {
        if (id === "public") {
            if (isVisibilitySetter(setter)) {
                setter("public");
            }
            refrenceOff.current!.classList.remove(styles.clickedOn);
            refrenceOn.current!.classList.add(styles.clickedOn);
        } else {
            if (isVisibilitySetter(setter)) {
                setter("private");
            }
            refrenceOn.current!.classList.remove(styles.clickedOn);
            refrenceOff.current!.classList.add(styles.clickedOn);
        }
    };

    const refrenceAr = useRef<HTMLInputElement>(null);
    const refrenceEn = useRef<HTMLInputElement>(null);
    const refrenceFr = useRef<HTMLInputElement>(null);
    const handleLanguageChange = (id: string) => {
        if (id === "en") {
            if (isLanguageSetter(setter)) {
                setter("en");
            }
            refrenceAr.current!.classList.remove(styles.clickedOn);
            refrenceFr.current!.classList.remove(styles.clickedOn);
            refrenceEn.current!.classList.add(styles.clickedOn);
        } else if (id === "ar") {
            if (isLanguageSetter(setter)) {
                setter("ar");
            }
            refrenceEn.current!.classList.remove(styles.clickedOn);
            refrenceFr.current!.classList.remove(styles.clickedOn);
            refrenceAr.current!.classList.add(styles.clickedOn);
        } else {
            if (isLanguageSetter(setter)) {
                setter("fr");
            }
            refrenceEn.current!.classList.remove(styles.clickedOn);
            refrenceAr.current!.classList.remove(styles.clickedOn);
            refrenceFr.current!.classList.add(styles.clickedOn);
        }
    };

    useEffect(() => {
        if (type === "language") {
            if (init === "en") {
                refrenceAr.current!.classList.remove(styles.clickedOn);
                refrenceFr.current!.classList.remove(styles.clickedOn);
                refrenceEn.current!.classList.add(styles.clickedOn);
            } else if (init === "ar") {
                refrenceEn.current!.classList.remove(styles.clickedOn);
                refrenceFr.current!.classList.remove(styles.clickedOn);
                refrenceAr.current!.classList.add(styles.clickedOn);
            } else {
                refrenceEn.current!.classList.remove(styles.clickedOn);
                refrenceAr.current!.classList.remove(styles.clickedOn);
                refrenceFr.current!.classList.add(styles.clickedOn);
            }
        } else {
            if (init === "public") {
                refrenceOff.current!.classList.remove(styles.clickedOn);
                refrenceOn.current!.classList.add(styles.clickedOn);
            } else {
                refrenceOn.current!.classList.remove(styles.clickedOn);
                refrenceOff.current!.classList.add(styles.clickedOn);
            }
        }
    }, [type, init]);

    return (
        <div className={styles.selectionsSections}>
            <div>
                <h3 style={{ margin: 0 }}>{title}</h3>
                <DescriptionComponent text={description} />
            </div>
            {type === "language" ? (
                <div className={styles.buttonChoice}>
                    <span
                        className={`${styles.clickedOff}`}
                        ref={refrenceAr}
                        onClick={() => handleLanguageChange("ar")}
                    >
                        AR
                    </span>
                    <span
                        className={`${styles.clickedOff}`}
                        ref={refrenceEn}
                        onClick={() => handleLanguageChange("en")}
                    >
                        EN
                    </span>
                    <span
                        className={`${styles.clickedOff}`}
                        ref={refrenceFr}
                        onClick={() => handleLanguageChange("fr")}
                    >
                        FR
                    </span>
                </div>
            ) : (
                <div className={styles.buttonOnOff}>
                    <span
                        ref={refrenceOn}
                        onClick={() => handleNonLanguageChange("public")}
                    ></span>
                    <span
                        ref={refrenceOff}
                        onClick={() => handleNonLanguageChange("private")}
                    ></span>
                </div>
            )}
        </div>
    );
}
