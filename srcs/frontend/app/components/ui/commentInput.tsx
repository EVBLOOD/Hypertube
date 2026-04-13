'use client';

import ButtonCustom from './buttonCustom';
import styles from './commentInput.module.css'

export default function CommentInput() {
    return (<div className={styles.commentPublishing}>
        <img className={styles.commentPublishingAvatar} src="/hero.png" alt="avatar" />
        <div className={styles.commentAndButton}>
            <textarea placeholder="WRITE A TRANSMISSION..." className={styles.textCommentErea} />
            <ButtonCustom className={styles.buttonPublish} textButton="POST COMMENT" buttonImage={undefined}></ButtonCustom>
        </div>
    </div>)
}