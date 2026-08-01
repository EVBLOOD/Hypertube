'use client';

import styles from './header.module.css'
import ButtonCustom from '../ui/buttonCustom'
import Link from 'next/link'
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/user';
import AuthService from '@/lib/services/AuthService';
import { useEffect, useState } from 'react';
import InputCustom from '../ui/inputCustom';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';


export default function Header() {
  const header = useTranslations('Header');
  const user = useUserStore((state) => state.user);
  const [openSearch, setOpenSearch] = useState(false)

  async function handleLogout() {
    try {
      await AuthService.logout()
      useUserStore.getState().reset()
    } catch (err) {
      console.log(err)
    }
  }
  function handleSearch() {
    setOpenSearch(!openSearch)
  }
  const pathname = usePathname()

  return (
    <>
      <div className={styles.headerWraperCantainer}>
        <div className={`container ${styles.headerWraper}`}>
          <h2 className={styles.logo} ><Link href={'/'}>HYPERTUBE</Link></h2>
          <div className={styles.optionsWraper}>
            <Link href='/library' className={`${pathname.split('/')[2] == 'library' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}>{header('library')}</Link>
            <Link href='/trending' className={`${pathname.split('/')[2] == 'trending' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}>{header('trending')}</Link>
            <Link href='/watchlist' className={`${pathname.split('/')[2] == 'watchlist' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}>{header('watchlist')}</Link>
            <Link href='/profile' className={`${pathname.split('/')[2] == 'profile' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}>{header('my_vault')}</Link>
          </div>
          <div className={styles.actionsWraper}>
            <img onClick={handleSearch} style={{ cursor: 'pointer' }} src="/costumIcons/icon.svg" alt="search" className={styles.searchButton} />
            {!user ? <ButtonCustom href='/login' style={{ width: '90px' }} buttonImage={undefined} textButton={header('sign_in')} color='var(--primary-color)' /> :
              <ButtonCustom onClick={handleLogout} style={{ width: '90px' }} buttonImage={undefined} textButton={header('sign_out')} color='var(--primary-color)' />}
          </div>
        </div>
      </div>

      <div className={styles.phoneNavBarHolder}>
        <Link href='/library' className={`${`${pathname.split('/')[2] == 'library' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}`}><img height={'20px'} src="/costumIcons/play.svg" alt="library" /> <span>library</span></Link>
        <Link href='/trending' className={`${pathname.split('/')[2] == 'trending' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}><img height={'20px'} src="/costumIcons/play.svg" alt="trending" /> <span>trending</span></Link>
        <Link href='/watchlist' className={`${pathname.split('/')[2] == 'watchlist' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}><img height={'20px'} src="/costumIcons/play.svg" alt="watchlist" /><span>watchlist</span></Link>
        <Link href='/profile' className={`${pathname.split('/')[2] == 'profile' ? styles.optionSelection : ''} ${styles.optionNotSelection}`}><img height={'20px'} src="/costumIcons/play.svg" alt="my_vault" /><span>my_vault</span></Link>
      </div>
    </>
  )
}