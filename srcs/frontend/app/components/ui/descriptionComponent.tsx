import styles from './descriptionComponent.module.css'

export default function DescriptionComponent({text, className}: {text: string, className?: string}) {
    return (
    <p className={`${styles.traningDescriptionElement} ${className ? className : ''}`}>
        {text}
    </p>
    )
}