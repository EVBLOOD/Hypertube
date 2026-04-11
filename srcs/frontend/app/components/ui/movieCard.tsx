import ButtonCustom from './buttonCustom'
import styles from './movieCard.module.css'
import TitleCustom from './titleCustom'

export default function MovieCard() {
    return (
        <div>
            <div style={{backgroundImage: "url('/hero.png')"}} className={styles.cardImage}>
                <div className={styles.seenWrapper}>
                    <ButtonCustom textButton='SEEN' buttonImage='/costumIcons/play.svg' color='primary' className={styles.wasSeen}/>
                </div>
                <div  className={styles.infosWraper}>
                    <ButtonCustom className={styles.infoStyle} textButton='1080P' buttonImage={undefined}/>
                    <ButtonCustom className={styles.infoStyle} textButton='5.1 SURROUND' buttonImage={undefined}/>
                </div>
            </div>
            {/* <TitleCustom title='CHINATOWN REVISITED'></TitleCustom> */}
        </div>
    )
}