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


export default function MoviePage({ params }: { params: Promise<{ id: number }> }) {

    const resolvedParams = use(params)
    const id = resolvedParams.id

    // I should cheack if the number is number // later to do

    return (
        <div>
            <HeroSectionMovie />
            <div style={{ backgroundColor: '#131313', paddingBottom: '80px' }} >
                <div className="container">
                    <div className={styles.productionWraper}>
                        <div className={styles.productionLogTitleDeco}></div>
                        <TitleCustom title="PRODUCTION LOGS" nb_color={-2} className={styles.productionLogTitle} />
                    </div>
                    <div className={styles.productionLogElements}>
                        <ProdictionAuthorCard />
                        <ProdictionAuthorCard />
                        <ProdictionAuthorCard />
                        <ProdictionAuthorCard />
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