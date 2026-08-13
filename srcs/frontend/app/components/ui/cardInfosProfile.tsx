"use client";

import styles from "./cardInfosProfile.module.css";
import DescriptionComponent from "./descriptionComponent";

export default function CardInfosProfile() {
    return (
        <div className={styles.cardInfos}>
            <span className={styles.cardTitle}>Accumulated Exposure</span>
            <div className={styles.cardMain}>
                <h1>1,428</h1>
                <h2>Hours</h2>
            </div>
            <DescriptionComponent text="Your consumption of metadata across the HyperTube network exceeds 84% of active directors in this sector."></DescriptionComponent>
        </div>
    );
}
