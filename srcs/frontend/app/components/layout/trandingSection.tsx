'use client';

import ButtonCustom from '../ui/buttonCustom'
import CardElementHighlight from '../ui/cardElementHighlight'
import DescriptionComponent from '../ui/descriptionComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './trandingSection.module.css'

export default function TrandingSection() {
    return (
        <div className={`container ${styles.trandingSectionParent}`}>
            <div className={styles.tradingHeader}>
                <div>
                    <h1 style={{ marginBottom: 0 }}>
                        Tranding
                    </h1>
                    <span className={styles.subTitleTranding}>
                        Curated Technical Selection
                    </span>
                </div>
                <div className={styles.tradingViewMore}>
                    <p>SEE ALL ENTRIES</p>
                    <img src="/costumIcons/go_in.svg" alt="Next" height='10px' />
                </div>
            </div>
            <div className={styles.trandingSection}>
                <CardElementHighlight className={styles.mainTrand} />
                <CardElementHighlight classNameTitle={styles.smallerTitle} className={styles.subtrand} yeExtra={false}/>
                <CardElementHighlight classNameTitle={styles.smallerTitle} className={styles.subtrand} yeExtra={false}/>
                <CardElementHighlight classNameTitle={styles.smallTitle} className={`${styles.subcollection} ${styles.collectionElement}`} yeIfos={false}/>
            </div>
        </div>
    )
}