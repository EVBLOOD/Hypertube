'use client';

import styles from './cardStatsProfile.module.css'
import DescriptionComponent from './descriptionComponent';

export default function CardStatsProfile() {
    return (
        <div className={styles.StatSingleCard}>
            <img src="/costumIcons/play.svg" alt="" height={'24px'} width={'24px'} />
            <h2>482</h2>
            <DescriptionComponent text='Approved Titles'></DescriptionComponent>
        </div>
    )
}