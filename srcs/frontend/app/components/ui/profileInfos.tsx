"use client";

import styles from "./profileInfos.module.css";

export default function ProfileInfos({
    lableName,
    placeHolder,
    className,
}: {
    lableName: string;
    placeHolder: string;
    className?: string;
}) {
    return (
        <div className={`${styles.inputSection} ${className}`}>
            <div>{lableName}</div>
            <div
                className={styles.inputElem}
            > {placeHolder} </div>
        </div>
    );
}
