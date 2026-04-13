'use client';

import styles from './recordComponent.module.css'

export default function RecordComponent({recText = ""}: {recText: string}) {
    return (
        <div className={styles.recordTitle}>
          <div className={styles.redDot}></div>
          <h4>● REC: {recText}</h4>
        </div>
    );
}