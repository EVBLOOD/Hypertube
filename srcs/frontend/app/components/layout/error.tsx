"use client";

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
    return (
        <div className={`container ${styles.errorPage}`}>
            <RecordComponent
                className={styles.recSizeChange}
                recText="Error Code Detected"
            ></RecordComponent>
            <TitleCustom
                className={styles.titleJust}
                title={`${errorMessage} (${errorCode})`}
            ></TitleCustom>
            <DescriptionComponent text="The page you are looking for wasn't recorded yet, rec in future."></DescriptionComponent>
            {errorCode == 403 || errorCode == 401 ? (
                <div className={styles.actionsButton}>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton="AUTHORIZE SESSION"
                        buttonImage={"/costumIcons/play.svg"}
                        color="primary"
                    ></ButtonCustom>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton="BACK TO HOME"
                        buttonImage={undefined}
                    ></ButtonCustom>
                </div>
            ) : (
                <div className={styles.actionsButton}>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton="BACK TO HOME"
                        buttonImage={"/costumIcons/play.svg"}
                        color="primary"
                    ></ButtonCustom>
                    <ButtonCustom
                        className={styles.buttonStyle}
                        textButton="REPORT ISSUE"
                        buttonImage={undefined}
                    ></ButtonCustom>
                </div>
            )}
        </div>
    );
}
