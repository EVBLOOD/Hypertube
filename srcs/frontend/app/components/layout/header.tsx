import { getTranslations } from 'next-intl/server'
import styles from './header.module.css'
import ButtonCustom from '../ui/buttonCustom'


export default async function Header() {
    const header = await getTranslations('Header')
    return (
        <div className={styles.headerWraper}>
          <h2 className={styles.logo} >HYPERTUBE</h2>
          <div className={styles.optionsWraper}>
            <div className={styles.optionSelection}>{header('library')}</div>
            <div>{header('trending')}</div>
            <div>{header('watchlist')}</div>
            <div>{header('my_vault')}</div>
          </div>
          <div className={styles.actionsWraper}>
            <img src="/costumIcons/icon.svg" alt="search" />
            <ButtonCustom hieght="36px" buttonImage={undefined} textButton={header('sign_in')} color='var(--primary-color)'/>
            {/* <ButtonCustom buttonImage={undefined} textButton={header('sign_out')} color='var(--primary-color)' /> */}
          </div>
        </div>
    )
}