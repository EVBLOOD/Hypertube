"use client";

import { useTranslations } from "next-intl";
import styles from "./userSearch.module.css";
import TitleCustom from "./titleCustom";
import { UserSearchType } from "@/types/apiTypes";
import { useRouter } from "next/navigation";

export default function UserSearchCard({
    user,
}: {
    user: UserSearchType;
    className?: string;
}) {
    const Library = useTranslations("Library");
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/user/${user.id}`)}
            className={styles.bodyCard}
        >
            <div
                style={{ backgroundImage: `url(${user.profilePicture || "avatar.png"})` }}
                className={styles.cardImage}
            >

            </div>
            <div className={styles.titleRatingWraper}>
                <TitleCustom
                    isMovie={true}
                    title={user.username}
                    nb_color={-user.username.length}
                ></TitleCustom>
            </div>
        </div>
    );
}
