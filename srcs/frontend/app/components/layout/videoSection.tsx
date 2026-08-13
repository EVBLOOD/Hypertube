"use client";
import styles from "./videoSection.module.css";

export default function VideoSection(props: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
}) {
    const IP = process.env.PUBLIC_API_URL || "http://localhost:8081/api";

    return (
        <div className={styles.videoSection}>
            <video
                controls
                preload="metadata"
                poster={props.thumbnail || "thumbnail.jpg"}
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
