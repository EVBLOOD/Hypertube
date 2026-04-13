'use client'

import ButtonCustom from './buttonCustom'
import DescriptionComponent from './descriptionComponent'
import styles from './viewInteractComment.module.css'

export default function ViewInteractComment() {
    return (
        <div className={styles.commentViewing}>
            <img className={styles.commentViewingAvatar} src="/hero.png" alt="avatar" />
            <div >
                <div className={styles.commentorInfos}>
                    <h4>USER_404_VOID</h4>
                    <DescriptionComponent text="2 HOURES AGO" />
                </div>
                <p className={styles.textCommentView}>The cinematography in the second act is unparalleled. The use of practical lighting to simulate digital interference is a masterclass. Best noir film of the decade.</p>
                <div className={styles.commentIntersction}>
                    <ButtonCustom buttonImage="/costumIcons/icon.svg" textButton="20" />
                    <ButtonCustom buttonImage={undefined} textButton="replay" />
                </div>
            </div>
        </div>
    )
}