'use client'

import ButtonCustom from './buttonCustom'
import DescriptionComponent from './descriptionComponent'
import styles from './viewInteractComment.module.css'
import { useTranslations } from 'next-intl'
import { CommentType } from '@/types/apiTypes'

export default function ViewInteractComment({ comment }: { comment: CommentType }) {
    const t = useTranslations('Comments')
    const author = comment.user?.username || comment.user?.firstName || 'USER'
    const hoursAgoText = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : t('hours_ago_2')
    return (
        <div className={styles.commentViewing}>
            <img className={styles.commentViewingAvatar} src="/hero.png" alt="avatar" />
            <div >
                <div className={styles.commentorInfos}>
                    <h4>{author}</h4>
                    <DescriptionComponent text={hoursAgoText} />
                </div>
                <p className={styles.textCommentView}>{comment.content}</p>
                <div className={styles.commentIntersction}>
                    <ButtonCustom buttonImage="/costumIcons/icon.svg" textButton="20" />
                    <ButtonCustom buttonImage={undefined} textButton={t('reply')} />
                </div>
            </div>
        </div>
    )
}