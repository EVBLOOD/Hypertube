import styles from './recordComponent.module.css'

export default function RecordComponent() {
    return (
        <div className={styles.recordTitle}>
          <div className={styles.redDot}></div>
          <h4>● REC: CLAPPER_OPEN</h4>
        </div>
    );
}