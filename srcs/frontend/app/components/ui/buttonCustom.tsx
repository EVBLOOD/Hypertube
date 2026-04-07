import styles from './buttonCustom.module.css'

export default function ButtonCustom({textButton, buttonImage, color, hieght}: {textButton: string, buttonImage: string|undefined, color?: string, hieght?: string}) {
    return (
        <button className={styles.button} style={{backgroundColor: color ? "var(--primary-color)" : 'var(--popup-background-second)', color: !color ? "var(--font-color-white)" : 'var(--popup-background-second)', height: hieght ? hieght : ''}}> 
        { buttonImage ? <img className={styles.buttonImage} src={buttonImage} alt={textButton} /> : ''}
        {textButton}</button>
    )
}