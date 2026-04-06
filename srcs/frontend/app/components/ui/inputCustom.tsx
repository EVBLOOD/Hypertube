import styles from './inputCustom.module.css'

export default function InputCustom({lableName, placeHolder, typeInput = 'text'}: {lableName: string, placeHolder: string, typeInput?: string}) {
    return (
        <div className={styles.inputSection}>
            <label htmlFor="">{lableName}</label>
            <input placeholder={placeHolder} className={styles.inputElem} type={typeInput} />
        </div>
    )
}