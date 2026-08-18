"use client";
import { useEffect, useRef } from "react";
import styles from "./videoSection.module.css";

export default function VideoSection(props: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    handleStartStream?: () => void;
    handlePauseStream?: () => void;
    handleSeekStream?: (time: number) => void;
    time?: number;
}) {
    const isRemoteUpdate = useRef(false);
    const IP = process.env.NEXT_PUBLIC_BACK_API_URL || "";

    const refVideo = useRef<HTMLVideoElement>(null);

    const handleSeek = () => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        if (props.handleSeekStream && refVideo.current) {
            props.handleSeekStream(refVideo.current.currentTime);
        }
    };
    const handlePlay = () => {
        if (props.handleStartStream) {
            props.handleStartStream();
        }
    }
    const handlePause = () => {
        if (props.handlePauseStream) {
            props.handlePauseStream();
        }
    }

    useEffect(() => {
        if (props.time !== undefined && refVideo.current) {
            if (Math.abs(refVideo.current.currentTime - props.time) > 0.5) {
                isRemoteUpdate.current = true;
                refVideo.current.currentTime = props.time;
            }
        }
    }, [props.time]);

    return (
        <div className={styles.videoSection}>
            <video
                key={props.id}
                controls
                preload="metadata"
                poster={props.thumbnail || "thumbnail.jpg"}
                onPlay={handlePlay}
                onPause={handlePause}
                ref={refVideo}
                onSeeked={handleSeek}
            >
                <source src={`${IP}/movies/watch/${props.id}`} />

                <track
                    kind="subtitles"
                    src="transcript-en.vtt"
                    srcLang="en"
                    label="English"
                    default
                ></track>

                <track
                    kind="subtitles"
                    src="transcript-es.vtt"
                    srcLang="es"
                    label="Spanish"
                ></track>
            </video>
        </div>
    );
}
