"use client";

import VideoSection from "@/app/components/layout/videoSection";
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails";
import { use, useEffect, useState } from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import WatchPartySection from "../../../components/layout/watchPartySection";
// import WatchPartySection from "./WatchPartySection";

export default function WatchPageMoviePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [watchAlone, setWatchAlone] = useState<boolean | null>(null);

    const id = resolvedParams.id;
    const { data, isPending, error } = useMovieDetails(id);
    
        useEffect(() => {
            if (token) {
                setWatchAlone(false);
            } else {
                setWatchAlone(true);
            }
        }, [token]);
    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error..</div>;


    if (watchAlone === true) 
        return (
            <div className={styles.watchContent}>
                <VideoSection
                    id={id}
                    title={data.data.movie.title}
                    description={data.data.movie.description}
                    thumbnail={data.data.movie.poster}
                />
            </div>
        );
    return (
        <div className={styles.watchContent}>
            <WatchPartySection
                    movieId={id}
                    roomToken={token}
                    movie={data.data.movie}
                />
        </div>);

}
