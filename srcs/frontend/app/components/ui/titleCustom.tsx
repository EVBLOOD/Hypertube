import styles from './titleCustom.module.css'

export default function TitleCustom({title, nb_color = 1, className}: {title: string, nb_color?: number, className?: string}) {
    const wordsList = title.split(' ');
    const firstWords = wordsList.slice(0, -nb_color).join(' ');
    const lastWord = wordsList.slice(-nb_color).join(' ');

    return (
        <h1 className={`${styles.title} ${className ? className : ''}`}> {firstWords} <span className={styles.titleDefColor}><br /> {lastWord}</span> </h1>
    )
}