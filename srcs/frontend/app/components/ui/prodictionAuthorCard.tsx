'use client';
import DescriptionComponent from './descriptionComponent';
import styles from './prodictionAuthorCard.module.css'

export default function ProdictionAuthorCard({role, name, overview}: {role: string, name: string, overview: string}) {
    return (
        <div className={styles.productionLogCard}>
            <span style={{ color: "var(--primary-color)", letterSpacing: '5px' }}>
                {role}
            </span>
            <h2>
                {name}
            </h2>
            <DescriptionComponent text={overview} />
        </div>
    )
}