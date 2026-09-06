"use client";

import styles from "./header.module.css";
import ButtonCustom from "../ui/buttonCustom";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/stores/user";
import AuthService from "@/lib/services/AuthService";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";

const getCookie = (name: string) => {
    if (typeof document === "undefined") return undefined;
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
};

export default function Header() {
    const header = useTranslations("Header");
    const router = useRouter();
    const pathname = usePathname();
    const user = useUserStore((state) => state.user) && getCookie("AUTH_TOKEN");

    async function handleLogout() {
        try {
            await AuthService.logout();
            useUserStore.getState().reset();
            router.push("/");
        } catch (err) {
            console.debug(err);
        } finally {
            useUserStore.getState().reset();
        }
    }
    function handleSearch() {
        router.push("/search");
    }

    return (
        <>
            <div className={styles.headerWraperCantainer}>
                <div className={`container ${styles.headerWraper}`}>
                    <h2 className={styles.logo}>
                        <Link href={"/"}>HYPERTUBE</Link>
                    </h2>
                    <div className={styles.optionsWraper}>
                        <Link
                            href="/library"
                            className={`${pathname.split("/")[2] == "library" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                        >
                            {header("navigation.library")}
                        </Link>
                        <Link
                            href="/trending"
                            className={`${pathname.split("/")[2] == "trending" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                        >
                            {header("navigation.trending")}
                        </Link>
                        <Link
                            href="/watchlist"
                            className={`${pathname.split("/")[2] == "watchlist" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                        >
                            {header("navigation.watchlist")}
                        </Link>
                        <Link
                            href="/profile"
                            className={`${pathname.split("/")[2] == "profile" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                        >
                            {header("navigation.myVault")}
                        </Link>
                    </div>
                    <div className={styles.actionsWraper}>
                        <Image
                            height={20}
                            width={20}
                            onClick={handleSearch}
                            style={{ cursor: "pointer" }}
                            src="/costumIcons/icon.svg"
                            alt={header("actions.search")}
                            className={styles.searchButton}
                        />
                        {!user ? (
                            <ButtonCustom
                                href="/login"
                                style={{ width: "90px" }}
                                buttonImage={undefined}
                                textButton={header("actions.signIn")}
                                color="var(--primary-color)"
                            />
                        ) : (
                            <ButtonCustom
                                onClick={handleLogout}
                                style={{ width: "90px" }}
                                buttonImage={undefined}
                                textButton={header("actions.signOut")}
                                color="var(--primary-color)"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.phoneNavBarHolder}>
                <Link
                    href="/library"
                    className={`${`${pathname.split("/")[2] == "library" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}`}
                >
                    <Image
                        height={20}
                        width={20}
                        src="/costumIcons/play.svg"
                        alt={header("navigation.library")}
                    />{" "}
                    <span>{header("navigation.library")}</span>
                </Link>
                <Link
                    href="/trending"
                    className={`${pathname.split("/")[2] == "trending" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                >
                    <Image
                        height={20}
                        width={20}
                        src="/costumIcons/play.svg"
                        alt={header("navigation.trending")}
                    />{" "}
                    <span>{header("navigation.trending")}</span>
                </Link>
                <Link
                    href="/watchlist"
                    className={`${pathname.split("/")[2] == "watchlist" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                >
                    <Image
                        height={20}
                        width={20}
                        src="/costumIcons/play.svg"
                        alt={header("navigation.watchlist")}
                    />
                    <span>{header("navigation.watchlist")}</span>
                </Link>
                <Link
                    href="/profile"
                    className={`${pathname.split("/")[2] == "profile" ? styles.optionSelection : ""} ${styles.optionNotSelection}`}
                >
                    <Image
                        height={20}
                        width={20}
                        src="/costumIcons/play.svg"
                        alt={header("navigation.myVault")}
                    />
                    <span>{header("navigation.myVault")}</span>
                </Link>
            </div>
        </>
    );
}
