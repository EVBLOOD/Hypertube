'use client';

import ButtonCustom from '../ui/buttonCustom'
import DescriptionComponent from '../ui/descriptionComponent'
import RecordComponent from '../ui/recordComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './heroSectionMovie.module.css'

export default function HeroSectionMovie() {
    return (
        <div className={styles.heroSectionWrap}>
            <div className={`container ${styles.heroSection}`}>
                <div className={`${styles.heroSectionTitle}`}>

                    <div className={styles.topTitleElement}>
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='4k ULTRA HD' buttonImage={undefined} color='primary' />
                        <RecordComponent />
                    </div>
                    <TitleCustom title='CHINATOWN NOIR REVIVAL' nb_color={2} />
                    <div className={styles.MovieHeroInfos}>
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='2024' buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='2H 14MIN' buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='8.9 IMDB' buttonImage={undefined} />
                        <ButtonCustom className={styles.MovieHeroInfosItems} textButton='12.4 GB' buttonImage={undefined} />

                    </div>
                    <DescriptionComponent
                        className={styles.heroSectionDescription}
                        text="Access the most secure, peer-to-peer technical vault for cinematic masterpieces. Uncompressed frames. Professional metadata. The divector's intent, preserved."
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