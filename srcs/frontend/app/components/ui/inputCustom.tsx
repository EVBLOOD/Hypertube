import type { Ref } from 'react'
import styles from './inputCustom.module.css'

export default function InputCustom({lableName, placeHolder, typeInput = 'text', ref}: {lableName: string, placeHolder: string, typeInput?: string, ref?: Ref<HTMLInputElement>}) {
    return (
        <div className={styles.inputSection}>
            <label htmlFor="">{lableName}</label>
            <input ref={ref} placeholder={placeHolder} className={styles.inputElem} type={typeInput} />
        </div>
    )
}