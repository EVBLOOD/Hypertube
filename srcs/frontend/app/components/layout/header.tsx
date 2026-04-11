'use client';

import styles from './header.module.css'
import ButtonCustom from '../ui/buttonCustom'
import Link from 'next/link'
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/user';
import AuthService from '@/lib/services/AuthService';


export default function Header() {
  const header = useTranslations('Header')
  const user = useUserStore((state) => state.user);

  async function handleLogout() {
    try {
      await AuthService.logout()
      useUserStore.getState().reset()
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div className={styles.headerWraper}>
      <h2 className={styles.logo} >HYPERTUBE</h2>
      <div className={styles.optionsWraper}>
        <Link href='/library' className={`${styles.optionSelection} ${styles.optionNotSelection}`}>{header('library')}</Link>
        <Link href='/library' className={styles.optionNotSelection}>{header('trending')}</Link>
        <Link href='/library' className={styles.optionNotSelection}>{header('watchlist')}</Link>
        <Link href='/library' className={styles.optionNotSelection}>{header('my_vault')}</Link>
      </div>
      <div className={styles.actionsWraper}>
        <img src="/costumIcons/icon.svg" alt="search" />
        {!user ? <ButtonCustom href='/login' style={{ width: '90px' }} buttonImage={undefined} textButton={header('sign_in')} color='var(--primary-color)' /> :
          <ButtonCustom onClick={handleLogout} style={{ width: '90px' }} buttonImage={undefined} textButton={header('sign_out')} color='var(--primary-color)' />}
      </div>
    </div>
  )
}