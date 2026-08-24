"use client";

import TitleCustom from "@/app/components/ui/titleCustom";
import styles from "./page.module.css";
import InputCustom from "@/app/components/ui/inputCustom";
import RecordComponent from "@/app/components/ui/recordComponent";
import SceneCustom from "@/app/components/ui/sceneCustom";
import ButtonCustom from "@/app/components/ui/buttonCustom";

import Modal from "@/app/components/layout/modal";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { useRouter } from "next/navigation";
import ProfileSelectionInputs from "@/app/components/ui/profileSelectionInputs";

export default function Search() {
    const Login = useTranslations("Login");
    const router = useRouter();
    const [userPrivacy, setUserPrivacy] = useState<"public" | "private">(
        "private",
    );

    const searchRef = useRef<HTMLInputElement>(null);
    const handleSearch = () => {
        const searchValue = searchRef.current?.value.trim();
        if (searchValue && searchValue.length > 0) {
            if (userPrivacy === "private") {
                router.push(`/library?search=${searchValue}`);
            } else {
                router.push(`/search/users/${searchValue}`);
            }
        }
    }


    return (
        <Modal>
            <div className={styles.searchContainer}>

                <InputCustom typeInput="text" lableName="Search" ref={searchRef} placeHolder="Search Here" className={styles.input}></InputCustom>
                <ButtonCustom
                    onClick={handleSearch}
                    buttonImage="/costumIcons/icon.svg"
                    textButton="Search"
                    color="var(--primary-color)"
                />

                <ProfileSelectionInputs
                    init={"private"}
                    setter={setUserPrivacy}
                    title="Search type"
                    description="Find Users or Movies"
                />
            </div>
        </Modal>
    );
}
