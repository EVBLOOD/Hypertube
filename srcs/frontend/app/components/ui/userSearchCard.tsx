"use client";

import styles from "./userSearch.module.css";
import TitleCustom from "./titleCustom";
import type { UserSearchType } from "@/types/app";
import { useRouter } from "next/navigation";

export default function UserSearchCard({
    user,
}: {
    user: UserSearchType;
    className?: string;
}) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/profile/${user.id}`)}
            className={styles.bodyCard}
        >
            <div
                style={{
                    backgroundImage: `url(${user.profilePicture || "avatar.png"})`,
                }}
                className={styles.cardImage}
            ></div>
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
