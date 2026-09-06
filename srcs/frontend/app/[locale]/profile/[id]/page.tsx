"use client";

import TitleCustom from "@/app/components/ui/titleCustom";
import styles from "./page.module.css";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import ProfileInfos from "@/app/components/ui/profileInfos";
import CardInfosProfile from "@/app/components/ui/cardInfosProfile";
import CardStatsProfile from "@/app/components/ui/cardStatsProfile";
import ProfileSelectionInputs from "@/app/components/ui/profileSelectionInputs";
import InteractionProfileCard from "@/app/components/ui/interactionProfileCard";
import Link from "next/link";
import TitleSectionProfile from "@/app/components/ui/titleSectionProfile";
import { useProfileSummaryById } from "@/lib/dataHooks/useProfileSummary";
import { use } from "react";
import LoadingPage from "@/app/components/layout/loading";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import type {
    ProfileHistoryItem,
    ProfileSummaryStats,
    ProfileSummaryUser,
} from "@/types/app";
import { getErrorMessage } from "@/lib/helper";
import { useTranslations } from "next-intl";


export default function ProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { data, isPending, error } = useProfileSummaryById(id);

    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const errorMessage = getErrorMessage(error);
        const errorCode = (error as AxiosError)?.response?.status || 404;
        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }
 
    return (
        <ProfileSectionPage
            userData={data?.user}
            stats={
                data?.stats || {
                    watched: 0,
                    wishlisted: 0,
                    liked: 0,
                    disliked: 0,
                    totalInteractions: 0,
                    watchedMinutes: 0,
                }
            }
            history={data?.history?.data || []}
            userId={id}
        />
    );
}

function ProfileSectionPage({
    userData,
    stats,
    history,
    userId,
}: {
    userData: ProfileSummaryUser;
    stats: ProfileSummaryStats;
    history: ProfileHistoryItem[];
    userId?: string;
}) {
    const Profile = useTranslations("ProfileOther");
    const t = useTranslations("ProfileOther.stats");
    const profilePicture = userData?.profilePicture || "/hero.png"
    const recentHistory = history.slice(0, 3);

    const ifSavedInServer = (path: string) => {
        if (path) {
            return path.includes("/")
                ? path
                : process.env.NEXT_PUBLIC_BACK_API_URL +
                `/users/avatar/${path}`;
        }
        return "/hero.png";
    };

    return (
        <div className={`container ${styles.browseContent}`}>
            <div className={styles.mainBrowseContentHead}>
                <div>
                    <TitleCustom title={Profile("title")} nb_color={-2} />
                    <DescriptionComponent text={Profile("description")} />
                </div>
            </div>

            <div className={styles.profileField}>
                {/* first part */}
                <div className={styles.firstPartHolder}>
                    {/* profile */}
                    <div className={styles.privateProfileSection}>
                        <div>
                            <TitleSectionProfile
                                title={Profile("publicInfo")}
                                icon="/costumIcons/private_settings.svg"
                            />
                        </div>
                        <div className={styles.personalInfosField}>
                            <div className={styles.profilePicture}>
                                <input
                                    hidden
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    className={styles.fileInput}
                                    disabled
                                />
                                <label
                                    htmlFor="fileInput"
                                    className={styles.avatarProfile}
                                    style={{
                                        backgroundImage: `url(${ifSavedInServer(profilePicture)})`,
                                    }}
                                ></label>
                            </div>
                            <div className={styles.inputsholder}>
                                <ProfileInfos
                                    placeHolder={userData?.username || "JohnDoe"}
                                    lableName={Profile("fields.username")}
                                ></ProfileInfos>
                                <ProfileInfos
                                    placeHolder={userData?.firstName || "John"}
                                    lableName={Profile("fields.firstName")}
                                ></ProfileInfos>
                                <ProfileInfos
                                    placeHolder={userData?.lastName || "Doe"}
                                    lableName={Profile("fields.lastName")}
                                ></ProfileInfos>
                            </div>
                        </div>
                        <ProfileSelectionInputs
                            init={userData.preferredLanguage || "en"}
                            title={Profile("settings.languageTitle")}
                            description={Profile("settings.languageDescription")}
                            type="language"
                            disable={true}
                        />
                    </div>
                    {/* receent interactions */}
                    <div className={styles.privateProfileSection}>
                        <div className={styles.interactionTitleSection}>
                            <TitleSectionProfile
                                title={Profile("recentIntersections")}
                                icon="/costumIcons/recent.svg"
                            />
                            <Link
                                href={`/history/${userId}`}
                                className={styles.interactionsOpenMore}
                            >
                                {Profile("actions.viewAllLogs")}
                            </Link>
                        </div>
                        <div className={styles.interactionsSection}>
                            {recentHistory.map(
                                (item: ProfileHistoryItem, index: number) => (
                                    <InteractionProfileCard
                                        key={index}
                                        movie={item}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                    <div></div>
                </div>
                {/* second part */}
                <div className={styles.secondPartHolder}>
                    <CardInfosProfile hours="0" description={t("exposureDescription")} />
                    <div className={styles.statisticCards}>
                        <CardStatsProfile title={t('moviesWatched')} icon="/costumIcons/movie-film.svg" count={stats.watched} />
                        <CardStatsProfile title={t('moviesWishlisted')} href="/watchlist" icon="/costumIcons/bookmark.svg" count={stats.wishlisted} />
                    </div>
                    <div className={styles.statisticCards}>
                        <CardStatsProfile title={t('moviesLiked')} icon="/costumIcons/like.svg" count={stats.liked} />
                        <CardStatsProfile title={t('moviesDisliked')} icon="/costumIcons/dislike.svg" count={stats.disliked} />
                    </div>
                </div>
            </div>
        </div>
    );
}
