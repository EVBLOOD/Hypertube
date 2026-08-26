"use client";

import ButtonCustom from "./buttonCustom";
import styles from "./commentInput.module.css";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function CommentInput({
    onSubmit,
    disabled = false,
}: {
    onSubmit?: (content: string) => void | Promise<void>;
    disabled?: boolean;
}) {
    const t = useTranslations("Comments");
    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed || disabled) return;
        await onSubmit?.(trimmed);
        setContent("");
    };

    return (
        <div className={styles.commentPublishing}>
            <img
                className={styles.commentPublishingAvatar}
                src="/hero.png"
                alt={t("avatarAlt")}
            />
            <div className={styles.commentAndButton}>
                <textarea
                    placeholder={t("placeholder")}
                    className={styles.textCommentErea}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                />
                <ButtonCustom
                    className={styles.buttonPublish}
                    textButton={t("post_button")}
                    buttonImage={undefined}
                    onClick={handleSubmit}
                ></ButtonCustom>
            </div>
        </div>
    );
}
