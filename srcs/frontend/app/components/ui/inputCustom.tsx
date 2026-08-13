"use client";

import type { Ref } from "react";
import styles from "./inputCustom.module.css";

export default function InputCustom({
    lableName,
    placeHolder,
    typeInput = "text",
    ref,
    className,
}: {
    lableName: string;
    placeHolder: string;
    typeInput?: string;
    ref?: Ref<HTMLInputElement>;
    className?: string;
}) {
    return (
        <div className={`${styles.inputSection} ${className}`}>
            <label htmlFor="">{lableName}</label>
            <input
                ref={ref}
                placeholder={placeHolder}
                className={styles.inputElem}
                type={typeInput}
            />
        </div>
    );
}
