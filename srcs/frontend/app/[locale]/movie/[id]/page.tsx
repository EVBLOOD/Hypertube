"use client";

import HeroSectionMovie from "@/app/components/layout/heroSectionMovie";
import { use } from "react";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import ProdictionAuthorCard from "@/app/components/ui/prodictionAuthorCard";
import ButtonCustom from "@/app/components/ui/buttonCustom";
import CommentInput from "@/app/components/ui/commentInput";
import ViewInteractComment from "@/app/components/ui/viewInteractComment";
import { useMovieDetails } from "@/lib/dataHooks/moviesDetails";
import LoadingPage from "@/app/components/layout/loading";


export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {

    const resolvedParams = use(params)
    const id = resolvedParams.id
    const { data, isPending, error } = useMovieDetails(id)
    if (isPending)
        return (
            <LoadingPage></LoadingPage>
        )
    if (error) return (
            <div>Error1..</div>
        )

    return (
        <div>
            <HeroSectionMovie obj={data.data.movie} />
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
                    <CommentInput />
                    <div className={styles.viewCommentSection}>
                        <ViewInteractComment />
                        <ViewInteractComment />
                        <ViewInteractComment />
                    </div>
                </div>
            </div>
        </div>
    )
}