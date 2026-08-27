"use client";

import TitleCustom from "@/app/components/ui/titleCustom";
import styles from "./page.module.css";
import InputCustom from "@/app/components/ui/inputCustom";
import RecordComponent from "@/app/components/ui/recordComponent";
import ButtonCustom from "@/app/components/ui/buttonCustom";

import Modal from "@/app/components/layout/modal";
import PopupCard from "@/app/components/layout/popupCard";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import AuthService from "@/lib/services/AuthService";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
    const ResetPassword = useTranslations("ResetPassword");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const router = useRouter();

    const passwordRef = useRef<HTMLInputElement>(null);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function handelResetPassword() {
        const password = passwordRef.current?.value;

        if (!password || password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }
        try {
            const result = await AuthService.resetPassword(
                token || "",
                password,
            );
            if (!result || !result.data) {
                alert("Reset password failed. Please check your details.");
                return;
            }
            router.push("/?passwordReset=success");
        } catch (err) {
            const errorMessage = (
                (err as AxiosError).response?.data as
                    { message: string } | { message: string[] }
            )?.message;
            if (typeof errorMessage === "string") {
                alert(errorMessage);
            } else if (Array.isArray(errorMessage) && errorMessage.length > 0) {
                alert(errorMessage[0]);
            } else {
                alert("Reset password failed. Please try again.");
            }
        }
    }

    return (
        <Modal>
            <PopupCard
                childrenHelfCard={
                    <>
                        <RecordComponent recText="" />
                        <TitleCustom
                            nb_color={2}
                            title={ResetPassword("title")}
                            className={styles.titleRegister}
                        />
                        <span>{ResetPassword("description")}</span>
                    </>
                }
                widthchildrenSecondHelfCard={width >= 768 ? 65 : undefined}
                childrenSecondHelfCard={
                    <>
                        <div className={styles.registerInfos}>
                            <InputCustom
                                ref={passwordRef}
                                lableName={ResetPassword("label_pass")}
                                placeHolder="••••••••••"
                                typeInput="password"
                            />
                            <div className={styles.passwordStringthContainer}>
                                <div className={styles.passwordStringth}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                                <p>SOLID PASSWORD</p>
                            </div>
                        </div>

                        <div>
                            <ButtonCustom
                                onClick={handelResetPassword}
                                textButton="INITIALIZE SESSION"
                                buttonImage={undefined}
                                color="primary"
                            />
                            <div className={styles.extraQs}>
                                {ResetPassword("ye_account")}
                                <Link href="/login">
                                    {ResetPassword("access_account")}
                                </Link>
                            </div>
                        </div>
                    </>
                }
            />
        </Modal>
    );
}
