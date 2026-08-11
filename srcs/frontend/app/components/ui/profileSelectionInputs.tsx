'use client';

import { useRef } from 'react';
import DescriptionComponent from './descriptionComponent';
import styles from './profileSelectionInputs.module.css'

export default function ProfileSelectionInputs({ title, description, type }: { title: string, description: string, type?: string }) {

    const refrenceOn = useRef<HTMLInputElement>(null)
    const refrenceOff = useRef<HTMLInputElement>(null)

    const handleNonLanguageChange = (id: string) => {
        if (id === 'on') {
            refrenceOff.current!.classList.remove(styles.clickedOn)
            refrenceOn.current!.classList.add(styles.clickedOn)
        } else {
            refrenceOn.current!.classList.remove(styles.clickedOn)
            refrenceOff.current!.classList.add(styles.clickedOn)
        }
    }
    const refrenceAr = useRef<HTMLInputElement>(null)
    const refrenceEn = useRef<HTMLInputElement>(null)
    const refrenceFr = useRef<HTMLInputElement>(null)
    const handleLanguageChange = (id: string) => {
        if (id === 'en') {
            refrenceAr.current!.classList.remove(styles.clickedOn)
            refrenceFr.current!.classList.remove(styles.clickedOn)
            refrenceEn.current!.classList.add(styles.clickedOn)
        } else if (id === 'ar') {
            refrenceEn.current!.classList.remove(styles.clickedOn)
            refrenceFr.current!.classList.remove(styles.clickedOn)
            refrenceAr.current!.classList.add(styles.clickedOn)
        } else {
            refrenceEn.current!.classList.remove(styles.clickedOn)
            refrenceAr.current!.classList.remove(styles.clickedOn)
            refrenceFr.current!.classList.add(styles.clickedOn)
        }
    }

    return (
        <div className={styles.selectionsSections}>
            <div>
                <h3 style={{ margin: 0 }}>{title}</h3>
                <DescriptionComponent text={description} />
            </div>
            {
                type === 'language' ? (
                    <div className={styles.buttonChoice}>
                        <span className={`${styles.clickedOff} ${styles.clickedOn}`} ref={refrenceAr} onClick={() => handleLanguageChange('ar')}>AR</span>
                        <span className={`${styles.clickedOff}`} ref={refrenceEn} onClick={() => handleLanguageChange('en')}>EN</span>
                        <span className={`${styles.clickedOff}`} ref={refrenceFr} onClick={() => handleLanguageChange('fr')}>FR</span>
                    </div>
                ) : (
                    <div className={styles.buttonOnOff}>
                        <span className={styles.clickedOn} ref={refrenceOn} onClick={() => handleNonLanguageChange('on')}></span>
                        <span ref={refrenceOff} onClick={() => handleNonLanguageChange('off')}></span>
                    </div>
                )
            }
        </div>
    )
}