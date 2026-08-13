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

export default function ProfilePage() {
    const { data, isPending, error } = useProfileSummary();
    const { user, userLogged, userLanguageUpdate } = useUserStore();
    const userNameRef = useRef<HTMLInputElement>(null);
    const userEmailRef = useRef<HTMLInputElement>(null);
    const [userLanguage, setUserLanguage] = useState<"en" | "ar" | "fr">("en");
    const [userPrivacy, setUserPrivacy] = useState<"public" | "private">(
        "public",
    );

    useEffect(() => {
        if (!data?.user) return;
        userNameRef.current!.value = data.user.username || "";
        userEmailRef.current!.value = data.user.email || "";
        setUserLanguage(data.user.preferredLanguage || "en");
        setUserPrivacy(data.user.privacy || "public");

        userLogged({
            username: data.user.username,
            language: data.user.preferredLanguage || "en",
            avatar: data.user.profilePicture || "/hero.png",
            isPublic: data.user.privacy === "public",
        });
    }, [data, userLogged]);

    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const axiosErr = error as AxiosError<any>;
        const errorMessage =
            axiosErr.response?.data?.message || "Something went wrong";
        const errorCode = axiosErr?.response?.status || 404;
        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }

    const stats = data?.stats || {
        watched: 0,
        wishlisted: 0,
        liked: 0,
        disliked: 0,
        totalInteractions: 0,
    };
    const history = data?.history?.data || [];

    const handleSave = async () => {
        if (!userNameRef.current || !userEmailRef.current) return;
        const form = {
            username: userNameRef.current?.value,
            email: userEmailRef.current?.value,
            preferredLanguage: userLanguage,
            privacy: userPrivacy,
        };
        const updated = await UserService.updateMe(form);
        if (updated?.preferredLanguage) {
            userLanguageUpdate(updated.preferredLanguage);
        }
    };

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
                                <img
                                    className={styles.avatarProfile}
                                    src={user?.avatar || "/hero.png"}
                                    alt=""
                                    width="128px"
                                    height="128px"
                                />
                            </div>
                            <div className={styles.inputsholder}>
                                <InputCustom
                                    ref={userNameRef}
                                    placeHolder={"foo"}
                                    lableName="Director Alias"
                                ></InputCustom>
                                <InputCustom
                                    ref={userEmailRef}
                                    placeHolder={"email@example.com"}
                                    lableName="Secure Email"
                                ></InputCustom>
                            </div>
                        </div>
                        <ProfileSelectionInputs
                            init={user?.isPublic ? "public" : "private"}
                            setter={setUserPrivacy}
                            title="Public Preview"
                            description="Hide primary email address from community members"
                        />
                        <ProfileSelectionInputs
                            init={user?.language || "en"}
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
                            {history.map((item: any, index: number) => (
                                <InteractionProfileCard
                                    key={index}
                                    movie={item}
                                />
                            ))}
                        </div>
                    </div>
                    <div></div>
                </div>
                {/* second part */}
                <div className={styles.secondPartHolder}>
                    <CardInfosProfile />
                    <div className={styles.statisticCards}>
                        <CardStatsProfile />
                        <CardStatsProfile />
                    </div>
                    <div className={styles.statisticCards}>
                        <CardStatsProfile />
                        <CardStatsProfile />
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
