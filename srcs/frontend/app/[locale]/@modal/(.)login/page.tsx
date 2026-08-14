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
import { useRef } from "react";
import AuthService from "@/lib/services/AuthService";
import { useUserStore } from "@/stores/user";

import { useRouter } from "next/navigation";

export default function Login() {
    const Login = useTranslations("Login");
    const router = useRouter();

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    const handleLogin42 = () => {
        const backendUrl = process.env.NEXT_PUBLIC_BACK_API_URL || "";

        const targetOrigin = new URL(backendUrl).origin;

        const childWindow = window.open(
            `${backendUrl}/auth/login/42`,
            "_blank",
            "width=500,height=600"
        );

        const messageListener = (event: MessageEvent) => {
            if (event.origin !== targetOrigin) return;
            console.log("Received message:", event.data);

            if (event.data?.type === "login_success") {
                console.log("User data:", event.data);

                useUserStore.getState().userLogged({
                    username: event.data.username,
                    language: event.data.preferredLanguage,
                    avatar: event.data.profilePicture,
                    isPublic: event.data.isPublic,
                });

                cleanup();
                childWindow?.close();
                router.push("/");
                console.log("Login successful:", event.data);
            }
        };

        const cleanup = () => {
            window.removeEventListener("message", messageListener);
            clearInterval(checkClosedInterval);
        };

        window.addEventListener("message", messageListener);

        const checkClosedInterval = setInterval(() => {
            if (childWindow?.closed) {
                cleanup();
            }
        }, 1000);
    };

    async function handelLogin() {
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        if (!password || password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }
        try {
            const result = (
                await AuthService.login({ username: email, password })
            )?.data;
            if (!result || !result.user) {
                alert("Login failed. Please check your credentials.");
                return;
            }
            const user = result.user;
            useUserStore.getState().userLogged({
                username: user.username,
                language: user.preferredLanguage,
                avatar: user.profilePicture,
                isPublic: user.isPublic,
            });
            console.log("Login successful:", user);

            router.push("/");
            // window.location.href = '/';
        } catch (err) {
            alert("Login failed. Please check your credentials.");
        }
    }

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
                                onClick={handleLogin42}
                                style={{display: 'flex', justifyContent: 'start', alignItems: 'center', paddingLeft: '10px'}}
                            ></ButtonCustom>
                            <ButtonCustom
                                textButton={Login.raw("integrations")[1]}
                                buttonImage="/costumIcons/42icon.svg"
                                onClick={handleLogin42}
                                style={{display: 'flex', justifyContent: 'start', alignItems: 'center', paddingLeft: '10px'}}
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
                                ref={emailRef}
                                lableName={Login("label_address")}
                                placeHolder={Login("label_address")}
                            />
                            <InputCustom
                                ref={passwordRef}
                                lableName={Login("label_pass")}
                                placeHolder="••••••••••"
                                typeInput="password"
                            />
                            <div className={styles.recoverPassword}>
                                <p>{Login("forgot_pass")}</p>
                            </div>
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
                    </>
                }
            />
        </Modal>
    );
}
