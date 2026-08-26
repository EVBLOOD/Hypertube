"use client";

import { useTranslations } from "next-intl";
import ButtonCustom from "../ui/buttonCustom";
import DescriptionComponent from "../ui/descriptionComponent";
import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";

import styles from "./error.module.css";

export default function ErrorPage({
    errorCode = 404,
    errorMessage = "SCENE MISSING",
}: {
    errorCode?: number;
    errorMessage?: string;
}) {
    const t = useTranslations("Error");

    return (
        <div className={`container ${styles.errorPage}`}>
            <RecordComponent
                className={styles.recSizeChange}
                recText={t("recordLabel")}
            ></RecordComponent>
            <TitleCustom
                className={styles.titleJust}
                title={`${errorMessage} (${errorCode})`}
            ></TitleCustom>
            <DescriptionComponent
                text={t("description")}
            ></DescriptionComponent>
            {errorCode == 403 || errorCode == 401 ? (
                <div className={styles.actionsButton}>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton={t("authorizeSession")}
                        buttonImage={"/costumIcons/play.svg"}
                        color="primary"
                    ></ButtonCustom>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton={t("backToHome")}
                        buttonImage={undefined}
                    ></ButtonCustom>
                </div>
            ) : (
                <div className={styles.actionsButton}>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton={t("backToHome")}
                        buttonImage={"/costumIcons/play.svg"}
                        color="primary"
                    ></ButtonCustom>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton={t("reportIssue")}
                        buttonImage={undefined}
                    ></ButtonCustom>
                </div>
            )}
        </div>
    );
}
