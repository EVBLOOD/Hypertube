import { useTranslations } from "next-intl";
import MovieService from "@/lib/services/MovieService";
import ButtonCustom from "../ui/buttonCustom";
import InputCustom from "../ui/inputCustom";
import styles from "./watchWith.module.css";
import { useRef } from "react";
import Image from "next/image";
import { toast } from "@/app/components/ui/toast";

export default function WatchWith({
    imdbId,
    title,
    onClose,
    setInviteSentAndWaitingRoomId,
}: {
    imdbId: string;
    title: string;
    onClose: () => void;
    setInviteSentAndWaitingRoomId: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations("WatchWith");

    async function handleSendInvite() {
        try {
            const userInput = inputRef.current?.value;
            if (!userInput) {
                toast.error(t("validation.emptyInput"));
                return;
            }
            const response = await MovieService.sendInvite(
                imdbId,
                title,
                userInput,
            );
            console.debug("Invite sent successfully:", response);

            toast.success(t("success.sent"));
            onClose();
            console.debug(response.data.token);
            setInviteSentAndWaitingRoomId(response.data.token || "");
        } catch (error) {
            console.debug("Error sending invite:", error);
            toast.error(t("error.sendFailed"));
        }
    }

    return (
        <div className={styles.watchWithContaining}>
            <div className={styles.watchWithPopOrginize}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <div style={{ fontWeight: "bolder" }}>
                        {t("title", { title })}
                    </div>
                    <div
                        style={{
                            cursor: "pointer",
                            fontWeight: "bold",
                            color: "white",
                        }}
                        onClick={onClose}
                    >
                        X
                    </div>
                </div>
                <div className={styles.watchWithContainer}>
                    <Image
                        height={100}
                        width={100}
                        src="/costumIcons/inviteWatch.svg"
                        alt={t("imageAlt")}
                    />
                    <InputCustom
                        typeInput="Text"
                        lableName={t("input.label")}
                        placeHolder={t("input.placeholder")}
                        ref={inputRef}
                    ></InputCustom>
                </div>
                <ButtonCustom
                    textButton={t("button.sendInvite")}
                    buttonImage={undefined}
                    onClick={handleSendInvite}
                ></ButtonCustom>
            </div>
        </div>
    );
}
