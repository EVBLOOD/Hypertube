'use client';
import styles from './scrollLoading.module.css'

export default function ScrollLoading() {
    return (
        <div className={styles.containerLoading}>
            <div className={styles.spiner}>
            </div>
            <div className={styles.loadingText}>
                LOADING NEXT PAGE...
            </div>
        </div>
    )
}