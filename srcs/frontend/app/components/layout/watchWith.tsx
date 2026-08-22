import MovieService from "@/lib/services/MovieService";
import ButtonCustom from "../ui/buttonCustom";
import InputCustom from "../ui/inputCustom";
import styles from "./watchWith.module.css";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function WatchWith({ imdbId, title, onClose, setInviteSentAndWaitingRoomId }: { imdbId: string; title: string; onClose: () => void; setInviteSentAndWaitingRoomId: (value: string) => void }) {

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter()

    async function handleSendInvite() {
        try {
            const userInput = inputRef.current?.value;
            if (!userInput) {
                alert("User input is empty.");
                return;
            }
            const response = await MovieService.sendInvite(imdbId, title, userInput);
            console.log("Invite sent successfully:", response);

            alert("Invite sent successfully.");
            onClose();
            console.log(response.data.token)
            setInviteSentAndWaitingRoomId(response.data.token ||"");
        } catch (error) {
            console.error("Error sending invite:", error);
            alert("Error sending invite.");
        }
    }

    return (
        <div className={styles.watchWithContaining}>
            <div className={styles.watchWithPopOrginize}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontWeight: "bolder" }}>
                        Watch {title} with your friends!
                    </div>
                    <div style={{ cursor: "pointer", fontWeight: "bold", color: "white" }} onClick={onClose}>
                        X
                    </div>
                </div>
                <div className={styles.watchWithContainer}>
                        <img width="100" height="100" src="/costumIcons/inviteWatch.svg" alt="Watch with friends" />
                        <InputCustom typeInput="Text" lableName="User Name or Email" placeHolder="User Name or Email" ref={inputRef}></InputCustom>
                </div>
                <ButtonCustom textButton="Send Invite" buttonImage={undefined} onClick={handleSendInvite}></ButtonCustom>
            </div>
        </div>
    );
}