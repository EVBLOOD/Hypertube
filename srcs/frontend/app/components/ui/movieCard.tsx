'use client';

import { useTranslations } from 'next-intl';
import ButtonCustom from './buttonCustom'
import DescriptionComponent from './descriptionComponent'
import styles from './movieCard.module.css'
import TitleCustom from './titleCustom'
import { MovieType } from '@/types/apiTypes';


export default function MovieCard({ movie }: { movie: MovieType }) {
    const Library = useTranslations('Library')
    return (
        <div key={movie.id} className={styles.bodyCard}>
            <div style={{ backgroundImage: `url(${movie.poster})` }} className={styles.cardImage}>
                <div className={styles.seenWrapper}>
                    {movie.isWatched ? <ButtonCustom textButton={Library('seen')} buttonImage='/costumIcons/play.svg' color='primary' className={styles.wasSeen} /> : ''}
                </div>

                <div className={styles.infosWraper}>
                    <ButtonCustom className={styles.infoStyle} textButton={movie.quality} buttonImage={undefined} />
                    <ButtonCustom className={styles.infoStyle} textButton={movie.standard_audio_format} buttonImage={undefined} />
                </div>
            </div>
            <div className={styles.titleRatingWraper}>
                <TitleCustom className={styles.movieTitle} title={movie.title} nb_color={-movie.title.length}></TitleCustom>
                <span>{movie.rating}</span>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <DescriptionComponent text={`${movie.year}`}></DescriptionComponent>
                <DescriptionComponent text={`${typeof movie.genres === 'string' ? movie.genres?.split(',')[0] : movie.genres?.length ? movie.genres[0] : movie.genres}`}></DescriptionComponent>
            </div>
        </div>
    )
}