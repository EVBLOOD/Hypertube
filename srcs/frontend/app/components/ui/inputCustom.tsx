"use client";

import type { Ref } from "react";
import styles from "./inputCustom.module.css";

export default function InputCustom({
    lableName,
    placeHolder,
    typeInput = "text",
    ref,
    className,
    onKeyPress,
}: {
    lableName: string;
    placeHolder: string;
    typeInput?: string;
    ref?: Ref<HTMLInputElement>;
    className?: string;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className={`${styles.inputSection} ${className}`}>
            <label htmlFor="">{lableName}</label>
            <input
                ref={ref}
                placeholder={placeHolder}
                className={styles.inputElem}
                type={typeInput}
                onKeyUp={onKeyPress}
            />
        </div>
    );
}
