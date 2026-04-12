import ButtonCustom from './buttonCustom'
import DescriptionComponent from './descriptionComponent'
import styles from './movieCard.module.css'
import TitleCustom from './titleCustom'

export default function MovieCard() {
    return (
        <div className={styles.bodyCard}>
            <div style={{backgroundImage: "url('/hero.png')"}} className={styles.cardImage}>
                <div className={styles.seenWrapper}>
                    <ButtonCustom textButton='SEEN' buttonImage='/costumIcons/play.svg' color='primary' className={styles.wasSeen}/>
                </div>
                <div  className={styles.infosWraper}>
                    <ButtonCustom className={styles.infoStyle} textButton='1080P' buttonImage={undefined}/>
                    <ButtonCustom className={styles.infoStyle} textButton='5.1 SURROUND' buttonImage={undefined}/>
                </div>
            </div>
            <div className={styles.titleRatingWraper}>
                <TitleCustom className={styles.movieTitle} title='CHINATOWN REVISITED' nb_color={-2}></TitleCustom>
                <span>8.4</span>
            </div>
            <DescriptionComponent text='2023 • NEON NOIR'></DescriptionComponent>
        </div>
    )
}