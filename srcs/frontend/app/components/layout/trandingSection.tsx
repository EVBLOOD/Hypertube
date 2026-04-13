'use client';

import { useTranslations } from 'use-intl';
import CardElementHighlight from '../ui/cardElementHighlight'
import styles from './trandingSection.module.css'

export default function TrandingSection() {
    const Home = useTranslations('Home');
    return (
        <div className={`container ${styles.trandingSectionParent}`}>
            <div className={styles.tradingHeader}>
                <div>
                    <h1 style={{ marginBottom: 0 }}>
                        {Home('tranding')}
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