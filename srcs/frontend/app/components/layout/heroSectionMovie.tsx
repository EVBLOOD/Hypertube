'use client';

import ButtonCustom from '../ui/buttonCustom'
import DescriptionComponent from '../ui/descriptionComponent'
import RecordComponent from '../ui/recordComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './heroSectionMovie.module.css'

export interface MovieInfos {
    id: string,
    title: string,
    year: number,
    rating: number,
    genres: string[],
    quality: string,
    standard_audio_format: string,
    poster: string,
    isWatched: boolean,
    overview?: string,
    size?: string,
    time?: number
}

export default function HeroSectionMovie({ obj }: {obj : any}) {

    // const obj: MovieInfos = {
    //     id: '',
    //     title: 'CHINATOWN NOIR REVIVAL',
    //     year: 2024,
    //     rating: 0, // 8.9 IMDB
    //     genres: [],
    //     quality: '4k ULTRA HD',
    //     standard_audio_format: '',
    //     poster: '',
    //     isWatched: false,
    //     overview: "Access the most secure, peer-to-peer technical vault for cinematic masterpieces. Uncompressed frames. Professional metadata. The divector's intent, preserved.",
    //     size: '12.4 GB',
    //     time: 0 // 2H 14MIN
    // }
    if (obj)
    return (
        <div style={{backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 90%),  url('${obj.poster}')`}} className={styles.heroSectionWrap}>
            <div className={`container ${styles.heroSection}`}>
                <div className={`${styles.heroSectionTitle}`}>

                    <div className={styles.topTitleElement}>
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton={obj.quality} buttonImage={undefined} color='primary' />
                        <RecordComponent recText='' />
                    </div>
                    <TitleCustom title={obj.title} nb_color={2} />
                    <div className={styles.MovieHeroInfos}>
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton={obj.year.toString()} buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton={obj.time?.toString() || '2H 14MIN'} buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton={`${obj.rating} IMDB`} buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton={obj.size || '12.4 GB'} buttonImage={undefined} />

                    </div>
                    <DescriptionComponent
                        className={styles.heroSectionDescription}
                        text={obj.overview || ''}
                    />
                </div>

                <div className={styles.heroSectionInfos}>
                    <ButtonCustom textButton='WATCH NOW' buttonImage='/costumIcons/play.svg' color='primary' />
                    <div className={styles.heroSectionActions}>
                        <ButtonCustom textButton='VIEW DETAILS' buttonImage={undefined} />
                        <ButtonCustom textButton='VIEW DETAILS' buttonImage={undefined} />
                    </div>
                    <div className={styles.reactOnMovie}>
                        <div>
                            <ButtonCustom className={styles.MovieHeroInfosItems} textButton='' buttonImage='/costumIcons/play.svg' />
                            <ButtonCustom className={styles.MovieHeroInfosItems} textButton='' buttonImage='/costumIcons/play.svg' />
                        </div>
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='' buttonImage='/costumIcons/play.svg' />
                    </div>
                </div>
            </div>

        </div>
    )
}