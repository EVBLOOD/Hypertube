"use client";

import styles from "./page.module.css";
import InputCustom from "@/app/components/ui/inputCustom";
import ButtonCustom from "@/app/components/ui/buttonCustom";

import Modal from "@/app/components/layout/modal";
import { useRef, useState } from "react";

import { useRouter } from "next/navigation";
import ProfileSelectionInputs from "@/app/components/ui/profileSelectionInputs";

export default function Search() {
    const router = useRouter();
    const searchRef = useRef<HTMLInputElement>(null);
    const [userPrivacy, setUserPrivacy] = useState<"public" | "private">(
        "private",
    );

    const handleSearch = () => {
        const searchValue = searchRef.current?.value.trim();
        if (searchValue && searchValue.length > 0) {
            if (userPrivacy === "private") {
                router.push(`/library?search=${encodeURIComponent(searchValue).replace(/\./g, '%2E')}`);
            } else {
                router.push(`/search/users/${encodeURIComponent(searchValue).replace(/\./g, '%2E')}`);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    }

    return (
        <Modal>
            <div className={styles.searchContainer}>
                <InputCustom
                    typeInput="text"
                    lableName="Search"
                    ref={searchRef}
                    placeHolder="Search Here"
                    className={styles.input}
                    onKeyPress={handleKeyPress}
                ></InputCustom>
                <ButtonCustom
                    onClick={handleSearch}
                    buttonImage="/costumIcons/Icon.svg"
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
