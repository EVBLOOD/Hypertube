'use client';

import { useTranslations } from 'use-intl';
import ButtonCustom from '../ui/buttonCustom'
import DescriptionComponent from '../ui/descriptionComponent'
import RecordComponent from '../ui/recordComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './heroSection.module.css'

export default function HeroSection() {
    const Home = useTranslations('Home');
    const Object = {
        "backdrop_path": "https://image.tmdb.org/t/p/original/"+"/xBT0oNq6rsTFv4SxG5uGRIEOrq6.jpg", // this is what I'll use
        "id": 936075, // I should have the imdb ID
        "title": "Michael", // movie title
        "original_title": "Michael",
        "overview": "Discover the story of Michael Jackson, one of the most influential artists the world has ever known, and his life beyond the music, tracing his journey from the discovery of his extraordinary talent as the lead of the Jackson Five, to the visionary artist whose creative ambition fueled a relentless pursuit to become the biggest entertainer in the world, highlighting both his life off-stage and some of the most iconic performances from his early solo career.",
        "original_language": "en", // based on each user
    }
    return (
        <div className={styles.heroSectionWrap}>
            <div className={`container ${styles.heroSection}`}>
                <RecordComponent recText={Home('rec')} />
                <div>
                    <TitleCustom title={Object.title} nb_color={(Object.title.split(' ').length == 1 ? 0 : Object.title.split(' ').length) - 1} /> 
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