import styles from './titleCustom.module.css'

export default function TitleCustom({title}: {title: string}) {
    const wordsList = title.split(' ');
    const firstWords = wordsList.slice(0, -1).join(' ');
    const lastWord = wordsList.pop()
    return (
        <h1 className={styles.title}> {firstWords} <span className={styles.titleDefColor}>{lastWord}</span> </h1>
    )
}