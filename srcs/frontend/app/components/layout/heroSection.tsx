'use client';

import { useTranslations } from 'use-intl';
import ButtonCustom from '../ui/buttonCustom'
import DescriptionComponent from '../ui/descriptionComponent'
import RecordComponent from '../ui/recordComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './heroSection.module.css'
import { useMovieHero } from '@/lib/dataHooks/moviesHero';

export default function HeroSection() {
    const Home = useTranslations('Home');
    const { data, isPending, error } = useMovieHero()
    if (!data)
        return (
            <div className={styles.heroSectionWrap}></div>
        )
    console.log(data)
    console.log(data.data)
    
    return (
        <div style={{backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 90%),  url('${data.data.poster}')`}} className={styles.heroSectionWrap}>
            <div className={`container ${styles.heroSection}`}>
                <RecordComponent recText={Home('rec')} />
                <div>
                    <TitleCustom title={data.data.title} nb_color={(data.data.title.split(' ').length == 1 ? 0 : data.data.title.split(' ').length) - 1} />
                    <DescriptionComponent
                        className={styles.heroSectionDescription}
                        text={Home('hero_discription')}
                    />
                </div>
                <div className={styles.heroSectionActions}>
                    <ButtonCustom textButton={Home('watch_now')} buttonImage='/costumIcons/play.svg' color='primary' />
                    <ButtonCustom textButton={Home('view_more')} buttonImage={undefined} />
                </div>

                <div className={styles.heroSectionInfos}>
                    <div>
                        <p>{Home('resolution')}</p>
                        <p style={{ color: "var(--primary-color)" }}>4K ULTRA HD</p>
                    </div>

                    <div>
                        <p>{Home('codec')}</p>
                        <p>H.265 / HEVC</p>
                    </div>

                    <div>
                        <p>{Home('bitrate')}</p>
                        <p>85 MBPS</p>
                    </div>
                </div>
            </div>

        </div>
    )
}