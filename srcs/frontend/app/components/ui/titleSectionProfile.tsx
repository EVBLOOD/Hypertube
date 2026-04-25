'use client';
import styles from './titleSectionProfile.module.css'

export default function TitleSectionProfile({ title, icon }: { title: string, icon: string }) {
    return (
        <div className={styles.sectionTitle}>
            <img src="/costumIcons/recent.svg" alt="" />
            <h2>Recent Intersections</h2>
        </div>
    )
}