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
import { useRouter } from "next/navigation";

export default function ResetPasswordEmail() {
    const ResetPasswordEmail = useTranslations("ResetPasswordEmail");

    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function handelRequestResetPassword() {
        const email = emailRef.current?.value;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const result = await AuthService.requestResetPassword(email);
            if (!result || !result.data) {
                alert("Email request failed. Please check your details.");
                return;
            } else {
                alert(
                    "Email request sent successfully. Please check your email.",
                );
            }
            router.push("/");
        } catch (err) {
            console.log((err as AxiosError).response?.data);
            const errorMessage = ((err as AxiosError).response?.data as any)
                .message;
            if (typeof errorMessage === "string") {
                alert(errorMessage);
            } else if (Array.isArray(errorMessage) && errorMessage.length > 0) {
                alert(errorMessage[0]);
            } else {
                alert("Email request failed. Please try again.");
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
                            title={ResetPasswordEmail("title")}
                            className={styles.titleRegister}
                        />
                        <span>{ResetPasswordEmail("description")}</span>
                    </>
                }
                // widthchildrenHelfCard={35}
                widthchildrenSecondHelfCard={width >= 768 ? 65 : undefined}
                childrenSecondHelfCard={
                    <>
                        <div className={styles.registerInfos}>
                            <InputCustom
                                ref={emailRef}
                                lableName={ResetPasswordEmail("label_address")}
                                placeHolder={ResetPasswordEmail(
                                    "holder_address",
                                )}
                            />
                        </div>

                        <div>
                            <ButtonCustom
                                onClick={handelRequestResetPassword}
                                textButton="REQUEST RESET PASSWORD"
                                buttonImage={undefined}
                                color="primary"
                            />
                            <div className={styles.extraQs}>
                                {ResetPasswordEmail("ye_account")}
                                <Link href="/login">
                                    {ResetPasswordEmail("access_account")}
                                </Link>
                            </div>
                        </div>
                    </>
                }
            />
        </Modal>
    );
}
