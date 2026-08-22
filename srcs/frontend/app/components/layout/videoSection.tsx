"use client";
import { useEffect, useRef, useState } from "react";
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
    isPlaying?: boolean;
    qualities?: string[];
    subtitles?: { lang: string, language: string, urlLink: string }[];
}) {
    const isRemoteUpdate = useRef(false);
    const IP = process.env.NEXT_PUBLIC_BACK_API_URL || "";
    const refVideo = useRef<HTMLVideoElement>(null);
    const [currentQuality, setCurrentQuality] = useState(props.qualities?.find((q) => q === '720p') ?
        '720p' : props.qualities?.[0]);

    const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newQuality = e.target.value;
        if (!refVideo.current) return;

        const currentTime = refVideo.current.currentTime;
        const isPlaying = !refVideo.current.paused;
        setCurrentQuality(newQuality);

        setTimeout(() => {
            if (refVideo.current) {
                refVideo.current.currentTime = currentTime;
                if (isPlaying) refVideo.current.play();
            }
        }, 50);
    };

    const handlePlay = () => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        props.handleStartStream?.();
    };

    const handlePause = () => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        props.handlePauseStream?.();
    };

    const handleSeek = () => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        if (refVideo.current) {
            props.handleSeekStream?.(refVideo.current.currentTime);
        }
    };

    const handleSeeking = () => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        if (refVideo.current) {
            props.handleSeekStream?.(refVideo.current.currentTime);
        }
    }

    useEffect(() => {
        if (!refVideo.current || !props.isPlaying) return;

        isRemoteUpdate.current = true;
        if (props.isPlaying) {
            refVideo.current.play().catch(() => { });
        } else {
            refVideo.current.pause();
        }
    }, [props.isPlaying]);

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
            {props.qualities && (
                <div className={styles.qualityControls}>
                    <select
                        value={currentQuality}
                        onChange={handleQualityChange}
                    >
                        {props.qualities.map((q, index) => (
                            <option key={index} value={q}>{q}</option>
                        ))}
                    </select>
                </div>
            )}
            <video
                key={props.id}
                src={`${IP}/movies/watch/${props.id}?quality=${currentQuality}`}
                controls
                preload="metadata"
                poster={props.thumbnail || "thumbnail.jpg"}
                onPlay={handlePlay}
                onPause={handlePause}
                ref={refVideo}
                onSeeked={handleSeek}
                onSeeking={handleSeeking}
                crossOrigin="anonymous"
            >

                {props.subtitles && props.subtitles.map((s, index) =>
                    <track
                        key={index}
                        kind="subtitles"
                        src={s.urlLink}
                        srcLang={s.language}
                        label={s.lang}
                    ></track>
                )}
            </video>
        </div>
    );
}
