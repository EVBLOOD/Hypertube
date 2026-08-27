import { useTranslations } from "next-intl";
import styles from "./shareTo.module.css";
import Image from "next/image";

export default function ShareTo({
    url,
    title,
    onClose,
}: {
    url: string;
    title: string;
    onClose: () => void;
}) {
    const t = useTranslations("Share");
    const encodeURIComponentTitle = encodeURIComponent(title);
    const encodeURIComponentUrl = encodeURIComponent(url);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponentUrl}`,
        x: `https://x.com/intent/post?text=${encodeURIComponentTitle}&url=${encodeURIComponentUrl}`,
        reddit: `https://www.reddit.com/submit?url=${encodeURIComponentUrl}&title=${encodeURIComponentTitle}`,
        gmail: `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponentTitle}&body=${encodeURIComponentUrl}`,
        email: `mailto:?subject=${encodeURIComponentTitle}&body=${encodeURIComponentUrl}`,
    };

    return (
        <div className={styles.shareToContaining}>
            <div className={styles.sharePopOrginize}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <div style={{ fontWeight: "bold" }}>
                        {t("title", { title })}
                    </div>
                    <div
                        style={{
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "white",
                        }}
                        onClick={onClose}
                    >
                        X
                    </div>
                </div>
                <div className={styles.shareToContainer}>
                    <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            height={1330}
                            width={23330}
                            src="/costumIcons/facebook.svg"
                            alt={t("platforms.facebook")}
                        />
                    </a>
                    <a
                        href={shareLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            height={20}
                            width={20}
                            src="/costumIcons/twitter.svg"
                            alt={t("platforms.x")}
                        />
                    </a>
                    <a
                        href={shareLinks.reddit}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            height={20}
                            width={20}
                            src="/costumIcons/reddit.svg"
                            alt={t("platforms.reddit")}
                        />
                    </a>
                    <a
                        href={shareLinks.email}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            height={20}
                            width={20}
                            src="/costumIcons/email.svg"
                            alt={t("platforms.email")}
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}
