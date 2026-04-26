'use client';

import { ReactNode } from "react";
import styles from './popupCard.module.css'

export default function PopupCard({ childrenHelfCard, childrenSecondHelfCard, widthchildrenHelfCard, widthchildrenSecondHelfCard }:
    { childrenHelfCard?: ReactNode, childrenSecondHelfCard?: ReactNode, widthchildrenHelfCard?: number, widthchildrenSecondHelfCard?: number }) {
        
    return (
        <div className={styles.card}>
            {childrenHelfCard ?
                <div className={styles.halfCard} style={{ width: widthchildrenHelfCard ? widthchildrenHelfCard.toString() + '%' : 'auto' }}>
                    {childrenHelfCard}
                </div>
                : ''}
            {childrenSecondHelfCard ?
                <div className={`${styles.secondHalf}`}
                    style={{ width: widthchildrenSecondHelfCard ? widthchildrenSecondHelfCard.toString() + '%' : 'auto' }}>
                    {childrenSecondHelfCard}
                </div>
                : ''}
        </div>
    )
}