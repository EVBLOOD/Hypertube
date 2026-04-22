
'use client';

import Filter from "@/app/components/layout/filter";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import MovieCard from "@/app/components/ui/movieCard";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MovieType } from "@/types/apiTypes";
import MovieService from "@/lib/services/MovieService";
import { useSuggestionsList } from "@/lib/dataHooks/moviesSuggestionsList";
import { useInView } from "react-intersection-observer";
import useDebounce from "@/lib/dataHooks/useDebounce";
import LoadingPage from "@/app/components/layout/loading";
import ErrorPage from "@/app/components/layout/error";
import { AxiosError } from "axios";
import ScrollLoading from "@/app/components/ui/scrollLoading";

export default function Library() {
  const Library = useTranslations('Library')
  const { ref: viewRef, inView } = useInView({ threshold: 0.1 })

  const [filters, setFilters] = useState({
    genre: 'all',
    minYear: 2017,
    maxYear: 2026,
    minRating: 8,
    sortBy: 'alpha'
    // odder: 'asc'
  });

  function OnChange(newFilters: typeof filters) {
    setFilters(newFilters);
  }
  //   const OnChange = React.useCallback((newFilters: typeof filters) => {
  //   setFilters(newFilters);
  // }, []);

  const debouncedSearch = useDebounce(filters, 500);


  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error, isPending } = useSuggestionsList(debouncedSearch);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  if (!data && error) {
    const axiosErr = error as AxiosError<any>
    const errorMessage = axiosErr.response?.data?.message || "Something went wrong"
    const errorCode = axiosErr?.response?.status || 404
    return <ErrorPage errorCode={errorCode} errorMessage={errorMessage} />
  }

  return (
    <div className={`container ${styles.browseContent}`}>
      <Filter onChange={OnChange} />
      <div className={styles.mainBrowseContent}>
        <div className={styles.mainBrowseContentHead}>
          <div>
            <TitleCustom title={Library('title')} nb_color={-2} />
            <DescriptionComponent text={Library('sub_title')} />
          </div>
          <div className={styles.wrapperInfoSearch}>
            <div className={styles.infosSearch}>
              <DescriptionComponent text={Library('resolution')} />
              <p style={{ color: "var(--primary-color)" }}>4K ULTRA HD</p>
            </div>
          </div>
        </div>
        {
          isPending && !data ? <LoadingPage /> :
            <>
              <div className={styles.moviesList}>
                {data?.pages.map((page, pageIndex) => (
                  <React.Fragment key={pageIndex}>
                    {page?.data?.map(
                      (movie: MovieType) => <MovieCard className="" key={movie.id} movie={movie}></MovieCard>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div ref={viewRef} style={{ height: 40 }}>
                {isFetchingNextPage ? (
                  <ScrollLoading />
                ) : ''}
              </div>
            </>
        }
      </div>
    </div>
  );
}
