import styles from './buttonCustom.module.css'

export default function ButtonCustom({textButton, buttonImage, color}: {textButton: string, buttonImage: string|undefined, color?: string}) {
    return (
        <button className={styles.button} style={{backgroundColor: color ? "var(--primary-color)" : 'var(--popup-background-second)', color: !color ? "var(--font-color-white)" : 'var(--popup-background-second)'}}> 
        { buttonImage ? <img className={styles.buttonImage} src={buttonImage} alt={textButton} /> : ''}
        {textButton}</button>
    )
}