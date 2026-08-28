"use client";

import VideoSection from "@/app/components/layout/videoSection";
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import WatchPartySection from "../../../components/layout/watchPartySection";
import {
    useMovieQualities,
    useMovieSubtitles,
} from "@/lib/dataHooks/movieWatch";
import LoadingPage from "@/app/components/layout/loading";
import { AxiosError } from "axios";
import ErrorPage from "@/app/components/layout/error";
import { useSocket } from "@/app/context/SocketContext";
import type { ApiErrorResponse } from "@/types/app";

export default function WatchPageMoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const { socket, isConnected } = useSocket();

    const token = searchParams.get("token");
    const watchAlone = token ? false : true;

    const id = resolvedParams.id;
    const { data, isPending, error } = useMovieDetails(id);
    const {
        data: qualitiesData,
        isPending: isQualitiesPending,
        error: qualitiesError,
    } = useMovieQualities(id);
    const {
        data: subtitlesData,
        isPending: isSubtitlesPending,
        error: subtitlesError,
    } = useMovieSubtitles(id);

    const [currentTime, setCurrentTime] = useState<number>(
        data?.data.personnel?.lastWatchedTime || 0,
    );

    const handlePlayMovie = () => {
        if (socket && isConnected) {
            socket.emit("play", {
                currentTime: currentTime || 0,
                imdbId: id,
            });
        }
    };
    const handlePauseMovie = () => {
        if (socket && isConnected) {
            socket.emit("pause", {
                currentTime: currentTime || 0,
                imdbId: id,
            });
        }
    };

    useEffect(() => {
        if (!socket || !isConnected) return;

        if (socket && isConnected) {
            socket.emit("heartbeat", {
                currentTime: currentTime || 0,
                imdbId: id,
            });
        }
    }, [currentTime, socket, isConnected, id]);

    if (isPending || isQualitiesPending || isSubtitlesPending)
        return <LoadingPage />;

    if (!data || error) {
        const errorMessage =
            (
                (error as AxiosError).response?.data as ApiErrorResponse
            )?.message?.[0] || "Something went wrong";
        const errorCode = (error as AxiosError)?.response?.status || 404;
        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }

    if (qualitiesError || subtitlesError) {
        const errorMessage =
            (
                (
                    (qualitiesError as AxiosError) ||
                    (subtitlesError as AxiosError)
                ).response?.data as ApiErrorResponse
            )?.message?.[0] || "Something went wrong";
        const errorCode =
            ((qualitiesError as AxiosError) || (subtitlesError as AxiosError))
                ?.response?.status || 404;
        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }

    if (watchAlone === true)
        return (
            <div className={styles.watchContent}>
                <VideoSection
                    id={id}
                    title={data.data.movie.title}
                    description={data.data.movie.description}
                    thumbnail={data.data.movie.poster}
                    qualities={qualitiesData?.data}
                    subtitles={subtitlesData?.data}
                    handlePlayMovie={handlePlayMovie}
                    handlePauseMovie={handlePauseMovie}
                    heartbeatInterval={setCurrentTime}
                    initialTime={data?.data.personnel?.lastWatchedTime || 0}
                />
            </div>
        );
    return (
        <div className={styles.watchContent}>
            <WatchPartySection
                movieId={id}
                roomToken={token}
                movie={data.data.movie}
                qualities={qualitiesData?.data}
                subtitles={subtitlesData?.data}
                handlePlayMovie={handlePlayMovie}
                handlePauseMovie={handlePauseMovie}
                heartbeatInterval={setCurrentTime}
                initialTime={data?.data.personnel?.lastWatchedTime || 0}
            />
        </div>
    );
}
