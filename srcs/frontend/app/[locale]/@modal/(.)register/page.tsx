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

export default function Register() {
    const Register = useTranslations("Register");

    const router = useRouter();

    const firstnameRef = useRef<HTMLInputElement>(null);
    const lastnameRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    async function handelRegister() {
        const firstname = firstnameRef.current?.value;
        const lastname = lastnameRef.current?.value;
        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        console.log(firstname, lastname, username, email, password);

        if (!firstname || !lastname || !username || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (username.length < 3) {
            alert("Username must be at least 3 characters long.");
            return;
        }
        if (firstname.length < 2 || lastname.length < 2) {
            alert(
                "First name and last name must be at least 2 characters long.",
            );
            return;
        }

        try {
            const result = await AuthService.register({
                firstName: firstname,
                lastName: lastname,
                username,
                email,
                password,
            });
            if (!result || !result.data) {
                alert("Registration failed. Please check your details.");
                return;
            }
            router.push("/login");
        } catch (err) {
            console.log((err as AxiosError).response?.data);
            const errorMessage = ((err as AxiosError).response?.data as any)
                .message;
            if (typeof errorMessage === "string") {
                alert(errorMessage);
            } else if (Array.isArray(errorMessage) && errorMessage.length > 0) {
                alert(errorMessage[0]);
            } else {
                alert("Registration failed. Please try again.");
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
                            title={Register("title")}
                            className={styles.titleRegister}
                        />
                        <span>{Register("description")}</span>
                    </>
                }
                widthchildrenHelfCard={35}
                widthchildrenSecondHelfCard={width >= 768 ? 65 : undefined}
                childrenSecondHelfCard={
                    <>
                        <div className={styles.registerInfos}>
                            <div className={styles.registerFullName}>
                                <InputCustom
                                    ref={firstnameRef}
                                    lableName={Register("label_first_name")}
                                    placeHolder={Register("holder_first_name")}
                                />
                                <InputCustom
                                    ref={lastnameRef}
                                    lableName={Register("label_last_name")}
                                    placeHolder={Register("holder_last_name")}
                                />
                            </div>
                            <InputCustom
                                ref={usernameRef}
                                lableName={Register("label_user_name")}
                                placeHolder={Register("holder_user_name")}
                            />
                            <InputCustom
                                ref={emailRef}
                                lableName={Register("label_address")}
                                placeHolder={Register("holder_address")}
                            />
                            <InputCustom
                                ref={passwordRef}
                                lableName={Register("label_pass")}
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
                                onClick={handelRegister}
                                textButton="INITIALIZE SESSION"
                                buttonImage={undefined}
                                color="primary"
                            />
                            <div className={styles.extraQs}>
                                {Register("ye_account")}
                                <Link href="/login">
                                    {Register("access_account")}
                                </Link>
                            </div>
                        </div>
                    </>
                }
            />
        </Modal>
    );
}
