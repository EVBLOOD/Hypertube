"use client";

import { useEffect, useRef, useState } from "react";
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
}

interface Message {
    content: string;
    sender: string;
    // timestamp: string;
}

export default function WatchPartySection({ movieId, roomToken, movie }: WatchPartyProps) {

    const { socket, isConnected } = useSocket();
    const [startStream, setStartStream] = useState(false);
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
            setMessages([...messages, {content: message.content, sender:"You"}]);
        }
        messageInputRef.current!.value = "";
    }

    const HandleStartStream = () => {
        if (socket && isConnected) {
            socket.emit("start_stream", { roomId: roomToken });
        }
    }

    const HandlePauseStream = () => {
        if (socket && isConnected) {
            socket.emit("pause_stream", { roomId: roomToken });
        }
    }

    const HandleSeekStream = (time: number) => {
        if (socket && isConnected) {
            socket.emit("seek_stream", { roomId: roomToken, time });
        }
    }

    useEffect(() => {
        if (!socket || !isConnected) return;
        
        socket.on("USER_JOINED", (params: any) => {
            setStartStream(true)
            console.log(params)
        })

        socket.on("MESSAGE", (message) => {
            console.log("Received message:", message);
           setMessages(prevMessages => [...prevMessages, {content: message.content, sender: "Other"}]);
        });

        socket.on("START_STREAM", (params: any) => {
            console.log("Stream started:", params);
            setStartStream(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
            setStartStream(false);
        });

        socket.on("PAUSE_STREAM", () => {
            console.log("Stream paused");
            setStartStream(false);
        });

        socket.on("SEEK_STREAM", (params: any) => {
            console.log("Stream seeked:", params);
        });


        console.log(`Joining room with token: ${roomToken}`);
        
        socket.emit('join_room', {roomId: roomToken })


        return () => {
            socket.off('USER_JOINED');
            socket.off('MESSAGE');
            socket.off('START_STREAM');
            socket.off('disconnect');
            socket.off('PAUSE_STREAM');
            socket.off('SEEK_STREAM');
        };
    }, [roomToken, movieId]);

    if (!startStream)
        return <LoadingPage></LoadingPage>

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
            />
            <div className={styles.chatSection}>
                <span>Status: {isConnected ? "Connected to Room" : "Connecting..."}</span>
                {messages.map((message, index) => (
                    <div key={index} className={`${styles.message} ${message.sender === "You" ? styles.yourMessage : styles.otherMessage}`}>
                        <strong>{message.sender === "You" ? "" : "Other: "}</strong> {message.content}
                    </div>
                ))}
                <div className={styles.chatInput}>
                    <InputCustom lableName="" placeHolder="" ref={messageInputRef}></InputCustom>
                    <ButtonCustom onClick={HandleSendMessage} buttonImage={undefined} textButton="Send Message"></ButtonCustom>
                </div>
            </div>

        </div>
    );
}