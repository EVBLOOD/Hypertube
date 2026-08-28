"use client";

import { ReactNode } from "react";
import styles from "./popupCard.module.css";

export default function PopupCard({
    childrenHelfCard,
    childrenSecondHelfCard,
}: {
    childrenHelfCard?: ReactNode;
    childrenSecondHelfCard?: ReactNode;
    widthchildrenHelfCard?: number;
    widthchildrenSecondHelfCard?: number;
}) {
    return (
        <div className={styles.card}>
            <div className={styles.cardinner}>
                {childrenHelfCard ? (
                    <div className={styles.halfCard}>{childrenHelfCard}</div>
                ) : (
                    ""
                )}
                {childrenSecondHelfCard ? (
                    <div className={`${styles.secondHalf}`}>
                        {childrenSecondHelfCard}
                    </div>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
