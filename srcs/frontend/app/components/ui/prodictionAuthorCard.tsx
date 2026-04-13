'use client';
import DescriptionComponent from './descriptionComponent';
import styles from './prodictionAuthorCard.module.css'

export default function ProdictionAuthorCard() {
    return (
        <div className={styles.productionLogCard}>
            <span style={{ color: "var(--primary-color)", letterSpacing: '5px' }}>
                Director
            </span>
            <h2>
                Saad AKLLAM
            </h2>
            <DescriptionComponent text="The visionary behind 'Static Dreams' and 'Neon Ghost'." />
        </div>
    )
}