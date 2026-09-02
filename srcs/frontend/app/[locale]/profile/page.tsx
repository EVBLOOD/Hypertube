"use client";

import TitleCustom from "@/app/components/ui/titleCustom";
import styles from "./page.module.css";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import InputCustom from "@/app/components/ui/inputCustom";
import ButtonCustom from "@/app/components/ui/buttonCustom";
import CardInfosProfile from "@/app/components/ui/cardInfosProfile";
import CardStatsProfile from "@/app/components/ui/cardStatsProfile";
import ProfileSelectionInputs from "@/app/components/ui/profileSelectionInputs";
import InteractionProfileCard from "@/app/components/ui/interactionProfileCard";
import Link from "next/link";
import TitleSectionProfile from "@/app/components/ui/titleSectionProfile";
import { useProfileSummary } from "@/lib/dataHooks/useProfileSummary";
import { useEffect, useRef, useState } from "react";
import UserService from "@/lib/services/UserService";
import LoadingPage from "@/app/components/layout/loading";
import { useUserStore } from "@/stores/user";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import { useRouter } from "next/navigation";
import type {
    ProfileHistoryItem,
    ProfileSummaryStats,
    ProfileSummaryUser,
    UpdateUserPayload,
} from "@/types/app";
import { getErrorMessage } from "@/lib/helper";
import { toast } from "@/app/components/ui/toast";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
    const { data, isPending, error } = useProfileSummary();

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
                }
            }
            history={data?.history?.data || []}
        />
    );
}

function ProfileSectionPage({
    userData,
    stats,
    history,
}: {
    userData: ProfileSummaryUser;
    stats: ProfileSummaryStats;
    history: ProfileHistoryItem[];
}) {
    const { user: __, userLogged: _, userLanguageUpdate } = useUserStore();
    const router = useRouter();

    const userNameRef = useRef<HTMLInputElement>(null);
    const userEmailRef = useRef<HTMLInputElement>(null);
    const userFirstNameRef = useRef<HTMLInputElement>(null);
    const userLastNameRef = useRef<HTMLInputElement>(null);
    const userPasswordRef = useRef<HTMLInputElement>(null);
    const [userLanguage, setUserLanguage] = useState<"en" | "ar" | "fr">(userData?.preferredLanguage || "en");
    const [userPrivacy, setUserPrivacy] = useState<"public" | "private">(userData?.privacy || "public");
    const [profilePicture, setProfilePicture] = useState<string>(userData?.profilePicture || "/hero.png");

    const t = useTranslations("Profile.stats");

    const ifSavedInServer = (path: string) => {
        if (path) {
            return path.includes("/")
                ? path
                : process.env.NEXT_PUBLIC_BACK_API_URL +
                      `/users/avatar/${path}`;
        }
        return "/hero.png";
    };
    const changeLanguage = (lang: string) => {
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
        router.push(`/${lang}`);
    };
    const handleSave = async () => {
        if (!userNameRef.current || !userEmailRef.current) return;

        const form: UpdateUserPayload = {
            username: userNameRef.current?.value,
            email: userEmailRef.current?.value,
            preferredLanguage: userLanguage,
            privacy: userPrivacy,
            firstName: userFirstNameRef.current?.value,
            lastName: userLastNameRef.current?.value,
            password: userPasswordRef.current?.value,
            profilePicture: profilePicture || null,
        };

        const updated = await UserService.updateMe(form);
        const updatedUser = updated?.user;
        const actions = updated?.actions || [];

        actions.forEach((action) => {
            toast.error(`Action: ${action}`);
        });
        console.debug("Updated user:", updatedUser);
        if (updatedUser?.preferredLanguage) {
            userLanguageUpdate(updatedUser.preferredLanguage);
            changeLanguage(updatedUser.preferredLanguage);
        }
    };

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const updated = await UserService.UpdateUserAvatar(formData);
            console.debug("Updated avatar:", updated);
            setProfilePicture(updated.filename);
            if (!updated) return;

            // userLogged({ ...user, avatar: img });
        } catch (error) {
            console.debug("Error updating profile picture:", error);
        }
    };

    useEffect(() => {
        if (!userData) return;
        if (userNameRef.current)
            userNameRef.current!.value = userData.username || "";
        if (userEmailRef.current)
            userEmailRef.current!.value = userData.email || "";
        if (userFirstNameRef.current)
            userFirstNameRef.current!.value = userData.firstName || "";
        if (userLastNameRef.current)
            userLastNameRef.current!.value = userData.lastName || "";

        // userLogged({
        //     username: data.user.username,
        //     language: data.user.preferredLanguage || "en",
        //     avatar: data.user.profilePicture || "/hero.png",
        //     isPublic: data.user.privacy === "public",
        // });
    }, [userData]);
    // }, [userData, userLogged]);

    return (
        <div className={`container ${styles.browseContent}`}>
            <div className={styles.mainBrowseContentHead}>
                <div>
                    <TitleCustom title={"Director’s Office"} nb_color={-2} />
                    <DescriptionComponent
                        text={`Watched: ${stats.watched} // Wishlisted: ${stats.wishlisted}`}
                    />
                </div>
            </div>

            <div className={styles.profileField}>
                {/* first part */}
                <div className={styles.firstPartHolder}>
                    {/* profile */}
                    <div className={styles.privateProfileSection}>
                        <div>
                            <TitleSectionProfile
                                title="Private Settings"
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
                                    onChange={handleFileChange}
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
                                <InputCustom
                                    ref={userNameRef}
                                    placeHolder={"foo"}
                                    lableName="Director Alias"
                                ></InputCustom>
                                <InputCustom
                                    ref={userFirstNameRef}
                                    placeHolder={"John"}
                                    lableName="Director first name"
                                ></InputCustom>
                                <InputCustom
                                    ref={userLastNameRef}
                                    placeHolder={"Doe"}
                                    lableName="Director last name"
                                ></InputCustom>
                                <InputCustom
                                    ref={userEmailRef}
                                    placeHolder={"email@example.com"}
                                    lableName="Secure Email"
                                ></InputCustom>
                                <InputCustom
                                    ref={userPasswordRef}
                                    typeInput="password"
                                    placeHolder={"********"}
                                    lableName="Secure Password"
                                ></InputCustom>
                            </div>
                        </div>
                        <ProfileSelectionInputs
                            init={userData.privacy === "public" ? "public" : "private"}
                            setter={setUserPrivacy}
                            title="Public Preview"
                            description="Hide your account from community members"
                        />
                        <ProfileSelectionInputs
                            init={userData.preferredLanguage || "en"}
                            setter={setUserLanguage}
                            title="System Language"
                            description="Default interface and metadata localization"
                            type="language"
                        />

                        <ButtonCustom
                            className={styles.submitChangesButton}
                            textButton="COMMIT CHANGES"
                            buttonImage={undefined}
                            color="primary"
                            onClick={handleSave}
                        ></ButtonCustom>
                    </div>
                    {/* receent interactions */}
                    <div className={styles.privateProfileSection}>
                        <div className={styles.interactionTitleSection}>
                            <TitleSectionProfile
                                title="Recent Intersections"
                                icon="/costumIcons/recent.svg"
                            />
                            <Link
                                href=""
                                className={styles.interactionsOpenMore}
                            >
                                View All Logs
                            </Link>
                        </div>
                        <div className={styles.interactionsSection}>
                            {history.map(
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
                    <CardInfosProfile hours="0" />
                    <div className={styles.statisticCards}>
                        <CardStatsProfile title={t('moviesWatched')} icon="/costumIcons/movie-film.svg" count={stats.watched} />
                        <CardStatsProfile title={t('moviesWishlisted')} href="/watchlist" icon="/costumIcons/bookmark.svg" count={stats.wishlisted} />
                    </div>
                    <div className={styles.statisticCards}>
                        <CardStatsProfile title={t('moviesLiked')} icon="/costumIcons/like.svg" count={stats.liked} />
                        <CardStatsProfile title={t('moviesDisliked')} icon="/costumIcons/dislike.svg" count={stats.disliked} />
                    </div>

                    <div className={styles.logsContainer}>
                        <h2>Security Logs</h2>
                        <div className={styles.SecurityLogs}>
                            <DescriptionComponent
                                className={styles.discreptionRemoveMargin}
                                text={`WATCHED: ${stats.watched} MOVIES`}
                            />
                            <p className={styles.discreptionRemoveMargin}>
                                {stats.totalInteractions} INTERACTIONS
                            </p>
                        </div>
                        <div className={styles.SecurityLogs}>
                            <DescriptionComponent
                                className={styles.discreptionRemoveMargin}
                                text={`LIKED: ${stats.liked} / DISLIKED: ${stats.disliked}`}
                            />
                            <p className={styles.discreptionRemoveMargin}>
                                {stats.wishlisted} WATCHLATER
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
