"use client";

import TitleCustom from "@/app/components/ui/titleCustom";
import styles from "./page.module.css";
import InputCustom from "@/app/components/ui/inputCustom";
import RecordComponent from "@/app/components/ui/recordComponent";
import SceneCustom from "@/app/components/ui/sceneCustom";
import ButtonCustom from "@/app/components/ui/buttonCustom";

import Modal from "@/app/components/layout/modal";
import PopupCard from "@/app/components/layout/popupCard";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/helper";
import { toast } from "@/app/components/ui/toast";

export default function Login() {
    const Login = useTranslations("Login");
    const router = useRouter();

    const emailOrUserNameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const childWindowRef = useRef<Window | null>(null);

    const changeLanguage = useCallback((lang: string) => {
        document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
        router.push(`/${lang}`);
    }, [router]);
    async function handelLogin() {
        const emailOrUserName = emailOrUserNameRef.current?.value;
        const password = passwordRef.current?.value;

        if (!emailOrUserName || emailOrUserName.trim() === "") {
            toast.error("Please enter a valid emailOrUserName address.");
            return;
        }
        if (!password || password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        try {
            const result = (
                await AuthService.login({ username: emailOrUserName, password })
            )?.data;
            if (!result || !result.user) {
                toast.error("Login failed. Please check your credentials.");
                return;
            }
            const user = result.user;

            useUserStore.getState().userLogged({
                username: user.username,
                language: user.preferredLanguage,
                avatar: user.profilePicture,
                isPublic: user.isPublic,
            });

            changeLanguage(user.preferredLanguage || "en");
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            if (errorMessage !== "An listed error occurred.") {
                toast.error(errorMessage);
            } else {
                toast.error("Login failed. Please check your credentials.");
            }
        }
    }

    useEffect(() => {
        const authChannel = new BroadcastChannel("auth_channel");

        authChannel.onmessage = (event) => {
            const userStore = useUserStore.getState();

            if (event.data?.type === "login_success") {
                const user = event.data.user?.user;

                const preferredLang = user.preferredLanguage || "en";
                useUserStore.getState().userLogged({
                    username: user.username,
                    language: user.preferredLanguage,
                    avatar: user.profilePicture,
                    isPublic: user.isPublic,
                });
                changeLanguage(preferredLang);

                if (childWindowRef.current && !childWindowRef.current.closed) {
                    childWindowRef.current.close();
                }
            } else if (event.data?.type === "login_failure" && !userStore.user) {
                toast.error("Login failed.");
            }
        };

        return () => {
            authChannel.close();
        };
    }, [changeLanguage]);

    const handleLoginOauth = (type: "github" | "google" | "42") => {
        const backendUrl = process.env.NEXT_PUBLIC_BACK_API_URL || "";

        childWindowRef.current = window.open(
            `${backendUrl}/auth/login/${type}`,
            "OAuthPopup",
            "width=500,height=600",
        );
    };

    return (
        <Modal>
            <PopupCard
                childrenHelfCard={
                    <>
                        <RecordComponent recText="" />
                        <TitleCustom title={Login("title")} />
                        <span>{Login("description")}</span>
                        <div>
                            {Login.raw("scenes").map(
                                (
                                    scene: { number: string; name: string },
                                    index: number,
                                ) => (
                                    <SceneCustom
                                        key={index}
                                        sceneNumber={scene.number}
                                        sceneName={scene.name}
                                    />
                                ),
                            )}
                        </div>
                        <div className={styles.buttonSpace}>
                            <div>{Login("integration")}</div>
                            <ButtonCustom
                                textButton={Login.raw("integrations")[0]}
                                buttonImage="/costumIcons/42icon.svg"
                                onClick={() => handleLoginOauth("42")}
                                style={{
                                    display: "flex",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    paddingLeft: "10px",
                                }}
                            ></ButtonCustom>
                            <ButtonCustom
                                textButton={Login.raw("integrations")[1]}
                                buttonImage="/costumIcons/42icon.svg"
                                onClick={() => handleLoginOauth("github")}
                                style={{
                                    display: "flex",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    paddingLeft: "10px",
                                }}
                            ></ButtonCustom>
                            <ButtonCustom
                                textButton={Login.raw("integrations")[2]}
                                buttonImage="/costumIcons/42icon.svg"
                                onClick={() => handleLoginOauth("google")}
                                style={{
                                    display: "flex",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    paddingLeft: "10px",
                                }}
                            ></ButtonCustom>
                        </div>
                    </>
                }
                childrenSecondHelfCard={
                    <>
                        <div>
                            <h1>{Login("second_title")}</h1>
                            <div>{Login("second_discreption")}</div>
                        </div>

                        <div className={styles.loginInfos}>
                            <InputCustom
                                ref={emailOrUserNameRef}
                                lableName={Login("label_address")}
                                placeHolder={Login("label_address")}
                            />
                            <InputCustom
                                ref={passwordRef}
                                lableName={Login("label_pass")}
                                placeHolder="••••••••••"
                                typeInput="password"
                            />
                            <Link
                                className={styles.recoverPassword}
                                style={{ color: "none" }}
                                href="/reset-password-email"
                            >
                                {Login("forgot_pass")}
                            </Link>
                        </div>
                        <div>
                            <ButtonCustom
                                onClick={handelLogin}
                                textButton="AUTHORIZE_ACCESS"
                                buttonImage={undefined}
                                color="primary"
                            />
                            <div className={styles.extraQs}>
                                {Login("no_account")}
                                <Link href="/register">
                                    {Login("create_account")}
                                </Link>
                            </div>
                        </div>


                        <div className={styles.buttonSpaceMobile}>
                            <div>{Login("integration_mobile")}</div>
                            <div className={styles.buttonMobile}>
                                <ButtonCustom
                                    textButton={Login.raw("integrations_mobile")[0]}
                                    buttonImage="/costumIcons/42icon.svg"
                                    onClick={() => handleLoginOauth("42")}
                                    style={{
                                        display: "flex",
                                        justifyContent: "start",
                                        alignItems: "center",
                                        paddingLeft: "10px",
                                    }}
                                ></ButtonCustom>
                                <ButtonCustom
                                    textButton={Login.raw("integrations_mobile")[1]}
                                    buttonImage="/costumIcons/42icon.svg"
                                    onClick={() => handleLoginOauth("github")}
                                    style={{
                                        display: "flex",
                                        justifyContent: "start",
                                        alignItems: "center",
                                        paddingLeft: "10px",
                                    }}
                                ></ButtonCustom>
                                <ButtonCustom
                                    textButton={Login.raw("integrations_mobile")[2]}
                                    buttonImage="/costumIcons/42icon.svg"
                                    onClick={() => handleLoginOauth("google")}
                                    style={{
                                        display: "flex",
                                        justifyContent: "start",
                                        alignItems: "center",
                                        paddingLeft: "10px",
                                    }}
                                ></ButtonCustom>
                            </div>
                        </div>
                    </>
                }
            />
        </Modal>
    );
}
