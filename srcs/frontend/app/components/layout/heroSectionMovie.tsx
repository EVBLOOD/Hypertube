"use client";

import { useEffect, useState } from "react";
import ButtonCustom from "../ui/buttonCustom";
import DescriptionComponent from "../ui/descriptionComponent";
import RecordComponent from "../ui/recordComponent";
import TitleCustom from "../ui/titleCustom";
import styles from "./heroSectionMovie.module.css";
import { useRouter } from "next/navigation";
import ShareTo from "./shareTo";
import WatchWith from "./watchWith";
import { useSocket } from "@/app/context/SocketContext";
import LoadingPage from "./loading";

export interface MovieInfos {
    id: string;
    title: string;
    year: number;
    rating: number;
    genres: string[];
    quality: string;
    standard_audio_format: string;
    poster: string;
    isWatched: boolean;
    overview?: string;
    size?: string;
    time?: number;
}

export default function HeroSectionMovie({
    obj,
    onLike,
    onDislike,
    onWishlist,
    isWishlisted = false,
    isLiked = false,
    isDisliked = false,
}: {
    obj: any;
    onLike?: () => void;
    onDislike?: () => void;
    onWishlist?: () => void;
    isWishlisted?: boolean;
    isLiked?: boolean;
    isDisliked?: boolean;
}) {
    const router = useRouter();

    const [openShare, setOpenShare] = useState(false);
    const [openWatch, setOpenWatch] = useState(false);
    const { socket, isConnected } = useSocket();
    const [inviteSentAndWaitingRoomId, setInviteSentAndWaitingRoomId] =
        useState("");

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on("INVITE_ACCEPTED", (params: any) => {
            console.log(
                `Received INVITE_ACCEPTED event with params: ${JSON.stringify(params)}`,
            );
            setInviteSentAndWaitingRoomId("");
            router.push(`/watch/${obj.id}?token=${params.roomId}`);
        });

        return () => {
            socket.emit("abort_stream", { roomId: obj.id });
            socket.off("INVITE_ACCEPTED");
            setInviteSentAndWaitingRoomId("");
        };
    }, [socket]);

    if (inviteSentAndWaitingRoomId.length > 0)
        return (
            <LoadingPage message="Waiting for friends to join..."></LoadingPage>
        );

    if (obj)
        return (
            <div
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 90%),  url('${obj.poster}')`,
                }}
                className={styles.heroSectionWrap}
            >
                <div className={`container ${styles.heroSection}`}>
                    <div className={`${styles.heroSectionTitle}`}>
                        <div className={styles.topTitleElement}>
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton={obj.quality}
                                buttonImage={undefined}
                                color="primary"
                            />
                            <RecordComponent recText="" />
                        </div>
                        <TitleCustom title={obj.title} nb_color={2} />
                        <div className={styles.MovieHeroInfos}>
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton={obj.year.toString()}
                                buttonImage={undefined}
                                color={null}
                            />
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton={obj.time?.toString() || "2H 14MIN"}
                                buttonImage={undefined}
                                color={null}
                            />
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton={`${obj.rating} IMDB`}
                                buttonImage={undefined}
                                color={null}
                            />
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton={obj.size || "12.4 GB"}
                                buttonImage={undefined}
                                color={null}
                            />
                        </div>
                        <DescriptionComponent
                            className={styles.heroSectionDescription}
                            text={obj.overview || ""}
                        />
                    </div>

                    <div className={styles.heroSectionInfos}>
                        <ButtonCustom
                            textButton="WATCH NOW"
                            buttonImage="/costumIcons/play.svg"
                            color="primary"
                            onClick={() => router.push(`/watch/${obj.id}`)}
                        />
                        <div className={styles.heroSectionActions}>
                            <ButtonCustom
                                textButton="WATCH LATER"
                                buttonImage={"/costumIcons/watchLater.svg"}
                                color={isWishlisted ? "primary" : null}
                                onClick={onWishlist}
                                style={{
                                    border: "var(--popup-background-second) 1px solid",
                                }}
                            />
                            <ButtonCustom
                                textButton="LIVE INVITE"
                                buttonImage={"/costumIcons/inviteWatch.svg"}
                                color={null}
                                style={{
                                    border: "var(--popup-background-second) 1px solid",
                                }}
                                onClick={() => {
                                    setOpenWatch(!openWatch);
                                }}
                            />
                        </div>
                        <div className={styles.reactOnMovie}>
                            <div>
                                <ButtonCustom
                                    className={styles.MovieHeroInfosItems}
                                    textButton=""
                                    buttonImage="/costumIcons/likeMovie.svg"
                                    color={isLiked ? "primary" : null}
                                    onClick={onLike}
                                />
                                <ButtonCustom
                                    className={styles.MovieHeroInfosItems}
                                    textButton=""
                                    buttonImage="/costumIcons/dislikeMovie.svg"
                                    color={isDisliked ? "primary" : null}
                                    onClick={onDislike}
                                />
                            </div>
                            <ButtonCustom
                                className={styles.MovieHeroInfosItems}
                                textButton=""
                                onClick={() => setOpenShare(!openShare)}
                                buttonImage="/costumIcons/shareMovie.svg"
                                color={null}
                            />
                            {openShare && (
                                <ShareTo
                                    url={`${process.env.NEXT_PUBLIC_BACK_API_URL}/movie/${obj.id}`}
                                    title={obj.title}
                                    onClose={() => setOpenShare(false)}
                                />
                            )}
                            {openWatch && (
                                <WatchWith
                                    imdbId={obj.id}
                                    title={obj.title}
                                    onClose={() => {
                                        setOpenWatch(false);
                                    }}
                                    setInviteSentAndWaitingRoomId={
                                        setInviteSentAndWaitingRoomId
                                    }
                                ></WatchWith>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
}
