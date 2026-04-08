import styles from './buttonCustom.module.css'
import type { CSSProperties } from 'react'

export default function ButtonCustom({textButton, buttonImage, color, style, className}: {textButton: string, buttonImage: string|undefined, color?: string, style?: CSSProperties, className?: string}) {
    return (
        <button 
            className={`${styles.button} ${className ? className : ''}`} 
            style={
                {backgroundColor: color ? "var(--primary-color)" : 'var(--popup-background-second)', 
                color: !color ? "var(--font-color-white)" : 'var(--popup-background-second)', ...style}}> 
        { buttonImage ? <img className={styles.buttonImage} src={buttonImage} alt={textButton} /> : ''}
        {textButton}</button>
    )
}