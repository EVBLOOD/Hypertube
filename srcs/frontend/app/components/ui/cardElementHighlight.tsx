'use client';

import { useTranslations } from 'next-intl';
import ButtonCustom from './buttonCustom'
import styles from './cardElementHighlight.module.css'
import DescriptionComponent from './descriptionComponent'
import TitleCustom from './titleCustom'

export default function CardElementHighlight({movie, className, yeExtra = true, yeIfos = true, classNameTitle}: {movie: any, className?: string, yeExtra?: boolean, yeIfos?: boolean, classNameTitle?: string}) {
    const Home = useTranslations('Home')

    return (<div  className={`${styles.mainCard} ${className ? className : ''}`} style={{backgroundImage: `url('${movie.poster}')`}} >
        {yeExtra ? <ButtonCustom textButton={Home('volt_type')} buttonImage={undefined} color={yeIfos ? 'primary' : ''} className={styles.cardPrimeTitle} style={!yeIfos ? {backgroundColor: 'transparent', color: 'var(--primary-color)', padding: 0, fontWeight: 'lighter', letterSpacing: '3px'}: {}} /> : ''}
        <div>
            <TitleCustom className={classNameTitle} title={movie.title}/>
            {
                yeExtra ?
                <DescriptionComponent text={movie.overview} />
                :
                ''
            }
        </div>
        {
            yeExtra && yeIfos ? 
                <div className={styles.infosCard}>
                    <p>IMDb {movie.rating}</p>
                    <p>{movie.time} {Home('minutes')}</p>
                </div>
            : ''
        }
    </div>
    )
}