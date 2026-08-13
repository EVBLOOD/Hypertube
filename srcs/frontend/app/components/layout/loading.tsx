"use client";

import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";

import styles from "./loading.module.css";

export default function LoadingPage() {
    return (
        <div className={styles.pandingPage}>
            <RecordComponent
                className={styles.recSizeChange}
                recText=""
            ></RecordComponent>
            <TitleCustom
                className={styles.titleJust}
                title="WAIT FOR LOADING DATA..."
            ></TitleCustom>
            <div className={styles.loadingBar}></div>
        </div>
    );
}
