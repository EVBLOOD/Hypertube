"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import InteractionProfileCard from "@/app/components/ui/interactionProfileCard";
import LoadingPage from "@/app/components/layout/loading";
import ErrorPage from "@/app/components/layout/error";
import { useProfileSummary } from "@/lib/dataHooks/useProfileSummary";
import { AxiosError } from "axios";
import { getErrorMessage } from "@/lib/helper";
import ScrollLoading from "@/app/components/ui/scrollLoading";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

export default function HistoryPage() {
    const { data, isPending, error } = useProfileSummary();
    const t = useTranslations("History");
    const { ref: viewRef, inView } = useInView({ threshold: 0.2 });
    const [visibleCount, setVisibleCount] = useState(8);

    const history = data?.history?.data || [];
    const hasMore = visibleCount < history.length;

    useEffect(() => {
        if (!inView || !hasMore) return;

        const timer = window.setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 6, history.length));
        }, 150);

        return () => window.clearTimeout(timer);
    }, [inView, hasMore, history.length]);

    if (!data && isPending) return <LoadingPage />;
    if (!data && error) {
        const errorMessage = getErrorMessage(error);
        const errorCode = (error as AxiosError)?.response?.status || 404;
        return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />;
    }

    return (
        <div className={`container ${styles.browseContent}`}>
            <div className={styles.mainBrowseContentHead}>
                <div>
                    <TitleCustom title={t("title")} nb_color={-2} />
                    <DescriptionComponent
                        text={ history.length > 0 ? 
                            `${history.length} ${t("total_interactions")}` : t("no_interactions")
                        }
                    />
                </div>
            </div>

            <div className={styles.historyList}>
                {history.length > 0 ? (
                    history.slice(0, visibleCount).map((item, index) => (
                        <InteractionProfileCard key={index} movie={item} />
                    ))
                ) : (
                    <div className={styles.emptyState}>{t("empty_state")}</div>
                )}
            </div>

            {hasMore && (
                <div ref={viewRef} style={{ height: 40 }}>
                    <ScrollLoading />
                </div>
            )}
        </div>
    );
}