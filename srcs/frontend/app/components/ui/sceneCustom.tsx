'use client';

import styles from './sceneCustom.module.css'

export default function SceneCustom({ sceneNumber, sceneName }: { sceneNumber: string, sceneName: string }) {
    return (<div className={styles.infoScene}>
        <div className={styles.firstWord}>{sceneNumber}</div>
        <div className={styles.lineSep}></div>
        <div>{sceneName}</div>
    </div>)
}