"use client";

import HeroSectionMovie from "@/app/components/layout/heroSectionMovie";
import { use, useEffect, useState } from "react";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import ProdictionAuthorCard from "@/app/components/ui/prodictionAuthorCard";
import CommentInput from "@/app/components/ui/commentInput";
import ViewInteractComment from "@/app/components/ui/viewInteractComment";
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails";
import LoadingPage from "@/app/components/layout/loading";
import { CommentType } from "@/types/apiTypes";
import MovieService from "@/lib/services/MovieService";


export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {

    const resolvedParams = use(params)
    const id = resolvedParams.id
    const { data, isPending, error } = useMovieDetails(id)
    const [comments, setComments] = useState<CommentType[]>([])
    const [wishlisted, setWishlisted] = useState(false)
    const [reaction, setReaction] = useState<number>(0)

    const sendComment = async (content: string) => {
        try {
            const comment = await MovieService.postComment(id, content)
            const created = comment.data || comment
            setComments((current) => {
                if (current.some((item) => item.id === created.id)) return current
                return [created, ...current]
            })
            return created
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                const commentsResponse = await MovieService.getComments({ queryKey: ['comments', id] })
                setComments(commentsResponse || [])
            } catch (err) {
                console.error(err)
            }
        }

        void load()
    }, [id])

    const handleLike = async () => {
        try {
            await MovieService.setInteraction({ queryKey: ['movie', id], interaction: 1 })
            setReaction(1)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDislike = async () => {
        try {
            await MovieService.setInteraction({ queryKey: ['movie', id], interaction: 2 })
            setReaction(2)
        } catch (err) {
            console.error(err)
        }
    }

    const handleWishlist = async () => {
        try {
            await MovieService.toggleWishlist(id)
            setWishlisted(value => !value)
        } catch (err) {
            console.error(err)
        }
    }

    const handleSubmitComment = async (content: string) => {
        try {
            const comment = await sendComment(content)
            if (comment) {
                setComments((current) => {
                    if (current.some((item) => item.id === comment.id)) return current
                    return [comment, ...current]
                })
                return
            }

            const response = await MovieService.postComment(id, content)
            const created = response.data || response
            setComments((current) => {
                if (current.some((item) => item.id === created.id)) return current
                return [created, ...current]
            })
        } catch (err) {
            console.error(err)
        }
    }

    if (isPending)
        return (
            <LoadingPage></LoadingPage>
        )
    if (error) return (
            <div>Error1..</div>
        )

    return (
        <div>
            <HeroSectionMovie
                obj={data.data.movie}
                onLike={handleLike}
                onDislike={handleDislike}
                onWishlist={handleWishlist}
                isWishlisted={wishlisted}
                isLiked={reaction === 1}
                isDisliked={reaction === 2}
            />
            <div style={{ backgroundColor: '#131313', paddingBottom: '80px' }} >
                <div className="container">
                    <div className={styles.productionWraper}>
                        <div className={styles.productionLogTitleDeco}></div>
                        <TitleCustom title="PRODUCTION LOGS" nb_color={-2} className={styles.productionLogTitle} />
                    </div>
                    <div className={styles.productionLogElements}>
                        
                        <ProdictionAuthorCard overview={"The director behind the Movie"} name={data.data.director} role="Director"/>
                        {data.data.actors.map((act: any, index: number) => <ProdictionAuthorCard key={index} name={act.name} role="Actor" overview={act.character} />)}
                    </div>
                </div>
            </div>
            <div className="container">
                <TitleCustom className={styles.commentSectionTitle} title="TRANSMISSIONS" nb_color={-1} />
                <div className={styles.commentInfos}>
                    <DescriptionComponent text="284 COMMENTS IN THREAD" />
                    <div className={styles.commentInfosFilter}>
                        <span className={styles.commentSelectedFilter}>LATEST</span>
                        <span>TOP RATED</span>
                    </div>
                </div>
                <div>
                    <CommentInput onSubmit={handleSubmitComment} />
                    <div className={styles.viewCommentSection}>
                        {comments.map((comment) => (
                            <ViewInteractComment key={comment.id} comment={comment} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}