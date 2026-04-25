'use client';

import DescriptionComponent from './descriptionComponent';
import styles from './interactionProfileCard.module.css'

export default function InteractionProfileCard() {

    return (
        <div className={styles.cardBody}>
            <div className={styles.coverTitleInfo}>
                <img src="/hero.png" alt="" width={'48px'} height={'64px'}/>
                <div>
                    <h3 className={styles.movieTitle}>Neo-Tokyo Protocol</h3>
                    <DescriptionComponent className={styles.discreptionMarginCorrection} text='Action / Sci-Fi • 1080p' />
                </div>
            </div>
            <div className={styles.interactionInofs}>
                <img src="/costumIcons/play.svg" alt="interact" />
                <DescriptionComponent className={styles.discreptionMarginCorrection} text='2h ago' />
            </div>
        </div>
    )
}