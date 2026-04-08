import ButtonCustom from './buttonCustom'
import styles from './cardElementHighlight.module.css'
import DescriptionComponent from './descriptionComponent'
import TitleCustom from './titleCustom'

export default function CardElementHighlight({className, yeExtra = true, yeIfos = true, classNameTitle}: {className?: string, yeExtra?: boolean, yeIfos?: boolean, classNameTitle?: string}) {
    return (<div  className={`${styles.mainCard} ${className ? className : ''}`}>
        {yeExtra ? <ButtonCustom textButton='PREMIUM VAULT' buttonImage={undefined} color={yeIfos ? 'primary' : ''} className={styles.cardPrimeTitle} style={!yeIfos ? {backgroundColor: 'transparent', color: 'var(--primary-color)', padding: 0, fontWeight: 'lighter', letterSpacing: '3px'}: {}} /> : ''}
        <div>
            <TitleCustom className={classNameTitle} title='The Last Frame '/>
            {
                yeExtra ?
                <DescriptionComponent text='A deep dive into the shadows of 1940s Los Angeles. Remastered from the original 35mm negatives.' />
                :
                ''
            }
        </div>
        {
            yeExtra && yeIfos ? 
                <div className={styles.infosCard}>
                    <p>IMDb 8.9</p>
                    <p>156 MIN</p>
                </div>
            : ''
        }
    </div>
    )
}