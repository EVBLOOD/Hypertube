import ButtonCustom from '../ui/buttonCustom'
import RecordComponent from '../ui/recordComponent'
import TitleCustom from '../ui/titleCustom'
import styles from './heroSection.module.css'

export default async function HeroSection() {
    return (
        <div className={styles.heroSection}>
                <RecordComponent />
                <TitleCustom title='CHINATOWN NOIR REVIVAL' />
                <p className={styles.heroSectionDescription}>
                    Access the most secure, peer-to-peer technical vault for cinematic masterpieces. Uncompressed frames. Professional metadata. The divector's intent, preserved.
                </p>
                <div className={styles.heroSectionActions}>
                    <ButtonCustom textButton='WATCH NOW' buttonImage='/costumIcons/play.svg' color='primary'/>
                    <ButtonCustom textButton='VIEW DETAILS' buttonImage={undefined} />
                </div>

                <div className={styles.heroSectionInfos}>
                    <div>
                        <p>RESOLUTION</p>
                        <p  style={{color: "var(--primary-color)"}}>4K ULTRA HD</p>
                    </div>
                    
                    <div>
                        <p>CODEC</p>
                        <p>H.265 / HEVC</p>
                    </div>
                    
                    <div>
                        <p>BITRATE</p>
                        <p>85 MBPS</p>
                    </div>
                </div>
                
        </div>
    )
}