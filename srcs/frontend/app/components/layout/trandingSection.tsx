'use client';

import { useTranslations } from 'use-intl';
import CardElementHighlight from '../ui/cardElementHighlight'
import styles from './trandingSection.module.css'
import { useRouter } from 'next/navigation';

export default function TrandingSection({movies}: {movies: any}) {
    const Home = useTranslations('Home');

    const router = useRouter()
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
                <div className={styles.tradingViewMore} onClick={() => router.push('/trending')}>
                    <p>SEE ALL ENTRIES</p>
                    <img src="/costumIcons/go_in.svg" alt="Next" height='10px' />
                </div>
            </div>
            <div className={styles.trandingSection}>
                <CardElementHighlight movie={movies[0]} className={styles.mainTrand} />
                <CardElementHighlight movie={movies[1]} classNameTitle={styles.smallerTitle} className={styles.subtrand} yeExtra={false}/>
                <CardElementHighlight movie={movies[2]} classNameTitle={styles.smallerTitle} className={styles.subtrand} yeExtra={false}/>
                <CardElementHighlight movie={movies[3]} classNameTitle={styles.smallTitle} className={`${styles.subcollection} ${styles.collectionElement}`} yeIfos={false}/>
            </div>
        </div>
    )
}