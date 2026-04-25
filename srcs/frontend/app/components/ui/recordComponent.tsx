'use client';

import styles from './recordComponent.module.css'

export default function RecordComponent({recText = "", className}: {recText: string, className?: string}) {
    return (
        <div className={`${styles.recordTitle} ${className}`}>
            <div className={styles.recText}>
                <div className={styles.redDot}></div>
                <h4>REC {recText.length ? ':' : ''}</h4>
            </div>
          <h4>{recText}</h4>
        </div>
    );
}