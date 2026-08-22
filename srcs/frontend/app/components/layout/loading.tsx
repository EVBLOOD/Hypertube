"use client";

import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";

import styles from "./loading.module.css";

export default function LoadingPage({ message = "WAIT FOR LOADING DATA..."}) {
    return (
        <div className={styles.pandingPage}>
            <RecordComponent
                className={styles.recSizeChange}
                recText=""
            ></RecordComponent>
            <TitleCustom
                className={styles.titleJust}
                title={message}
            ></TitleCustom>
            <div className={styles.loadingBar}></div>
        </div>
    );
}
