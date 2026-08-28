"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./watchPartySection.module.css";
import VideoSection from "@/app/components/layout/videoSection";
import LoadingPage from "@/app/components/layout/loading";
import { useSocket } from "@/app/context/SocketContext";
import InputCustom from "../ui/inputCustom";
import ButtonCustom from "../ui/buttonCustom";

interface WatchPartyProps {
    movieId: string;
    roomToken: string | null;
    movie: {
        title: string;
        description: string;
        poster: string;
    };
    qualities?: string[];
    subtitles?: { lang: string; language: string; urlLink: string }[];
    handlePlayMovie?: () => void;
    handlePauseMovie?: () => void;
    heartbeatInterval: React.Dispatch<React.SetStateAction<number>>;
    initialTime?: number;
}

interface Message {
    content: string;
    sender: string;
    // timestamp: string;
}

export default function WatchPartySection({
    movieId,
    roomToken,
    movie,
    qualities,
    subtitles,
    handlePlayMovie,
    handlePauseMovie,
    heartbeatInterval,
    initialTime,
}: WatchPartyProps) {
    const { socket, isConnected } = useSocket();
    const t = useTranslations("WatchParty");
    const [isRoomJoined, setIsRoomJoined] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState<number | undefined>(
        undefined,
    );

    const [messages, setMessages] = useState<Message[]>([]);
    const messageInputRef = useRef<HTMLInputElement>(null);

    const HandleSendMessage = () => {
        const messageContent = messageInputRef.current?.value || "";
        if (messageContent.trim() === "") return;

        const message = {
            content: messageContent,
            roomId: roomToken,
        };

        if (socket && isConnected) {
            socket.emit("send_message", message);
            setMessages((prev) => [
                ...prev,
                { content: message.content, sender: t("messages.self") },
            ]);
        }
        if (messageInputRef.current) messageInputRef.current.value = "";
    };

    const HandleStartStream = () => {
        if (socket && isConnected) {
            socket.emit("start_stream", { roomId: roomToken });
        }
    };

    const HandlePauseStream = () => {
        if (socket && isConnected) {
            socket.emit("pause_stream", { roomId: roomToken });
        }
    };

    const HandleSeekStream = (time: number) => {
        if (socket && isConnected) {
            socket.emit("seek_stream", { roomId: roomToken, time });
        }
    };

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("USER_JOINED", () => {
            setIsRoomJoined(true);
        });

        socket.on("MESSAGE", (message) => {
            setMessages((prev) => [
                ...prev,
                { content: message.content, sender: t("messages.other") },
            ]);
        });

        socket.on("START_STREAM", (params: { time?: number }) => {
            if (params?.time !== undefined) setCurrentTime(params.time);
            setIsPlaying(true);
        });

        socket.on("PAUSE_STREAM", (params: { time?: number }) => {
            if (params?.time !== undefined) setCurrentTime(params.time);
            setIsPlaying(false);
        });

        socket.on("SEEK_STREAM", (params: { time: number }) => {
            if (params?.time !== undefined) setCurrentTime(params.time);
        });

        socket.on("ABORT_STREAM", () => {
            setIsPlaying(false);
            setIsRoomJoined(false);
        });

        socket.on("disconnect", () => {
            setIsRoomJoined(false);
        });

        socket.emit("join_room", { roomId: roomToken });

        return () => {
            socket.off("USER_JOINED");
            socket.off("MESSAGE");
            socket.off("START_STREAM");
            socket.off("PAUSE_STREAM");
            socket.off("SEEK_STREAM");
            socket.off("ABORT_STREAM");
            socket.off("disconnect");
        };
    }, [socket, isConnected, roomToken, t]);

    if (!isRoomJoined) return <LoadingPage />;

    return (
        <div className={styles.watchPartySection}>
            <VideoSection
                id={movieId}
                title={movie.title}
                description={movie.description}
                thumbnail={movie.poster}
                handleStartStream={HandleStartStream}
                handlePauseStream={HandlePauseStream}
                handleSeekStream={HandleSeekStream}
                isPlaying={isPlaying}
                time={currentTime}
                qualities={qualities}
                subtitles={subtitles}
                handlePlayMovie={handlePlayMovie}
                handlePauseMovie={handlePauseMovie}
                heartbeatInterval={heartbeatInterval}
                initialTime={initialTime}
            />
            <div className={styles.chatSection}>
                <span>
                    Status:{" "}
                    {isConnected ? "Connected to Room" : "Connecting..."}
                </span>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${message.sender === "You" ? styles.yourMessage : styles.otherMessage}`}
                    >
                        <strong>
                            {message.sender === "You" ? "" : "Other: "}
                        </strong>{" "}
                        {message.content}
                    </div>
                ))}
                <div className={styles.chatInput}>
                    <InputCustom
                        lableName=""
                        placeHolder={t("chat.placeholder")}
                        ref={messageInputRef}
                    ></InputCustom>
                    <ButtonCustom
                        onClick={HandleSendMessage}
                        buttonImage={undefined}
                        textButton={t("chat.send")}
                    ></ButtonCustom>
                </div>
            </div>
        </div>
    );
}
