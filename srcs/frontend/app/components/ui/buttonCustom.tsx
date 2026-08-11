'use client';

import Link from 'next/link'
import styles from './buttonCustom.module.css'
import type { CSSProperties, MouseEventHandler } from 'react'

export default function ButtonCustom({textButton, buttonImage, color, style, className, href, onClick}: {textButton: string, buttonImage: string|undefined, color?: string | null, style?: CSSProperties, className?: string, href?: string, onClick?: MouseEventHandler<HTMLButtonElement>}) {
    return (!href ? (
        <button onClick={onClick}
            className={`${styles.button} ${className ? className : ''}`} 
            style={
                {backgroundColor: color ? "var(--primary-color)" : (color !== null ? 'var(--popup-background-second)' : ''), 
                color: !color ? "var(--font-color-white)" : 'var(--popup-background-second)', ...style}}> 
        { buttonImage ? <img className={styles.buttonImage} src={buttonImage} alt={textButton} /> : ''}
        {textButton}</button>
    ) :
     (
        <Link href={href} scroll={false}
            className={`${styles.button} ${className ? className : ''}`} 
            style={
                {backgroundColor: color ? "var(--primary-color)" : (color !== null ? 'var(--popup-background-second)' : ''), 
                color: !color ? "var(--font-color-white)" : 'var(--popup-background-second)', ...style}}> 
        { buttonImage ? <img className={styles.buttonImage} src={buttonImage} alt={textButton} /> : ''}
        {textButton}</Link>
    ))
}