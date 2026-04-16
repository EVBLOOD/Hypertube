
'use client';

import Filter from "@/app/components/layout/filter";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import MovieCard from "@/app/components/ui/movieCard";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { MovieType } from "@/types/apiTypes";
import MovieService from "@/lib/services/MovieService";
import { useSuggestionsList } from "@/lib/dataHooks/moviesSuggestionsList";
import { useInView } from "react-intersection-observer";
import useDebounce from "@/lib/dataHooks/useDebounce";

export default function Library() {
  const Library = useTranslations('Library')
  const { ref, inView } = useInView({ threshold: 0.1 })

  const [filters, setFilters] = useState({
    genre: 'all',
    minYear: 2017,
    maxYear: 2026,
    rating: 8,
    sortBy: 'alpha'
    // odder: 'asc'
  });

  function OnChange(newFilters: typeof filters) {
    setFilters(newFilters);
  }

  const debouncedSearch = useDebounce(filters, 500);


  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useSuggestionsList(debouncedSearch);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

        <div className={styles.moviesList}>
          {data?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page?.data?.map(
                (movie: MovieType) => <MovieCard key={movie.id} movie={movie}></MovieCard>
              )}
            </React.Fragment>
          ))}
        </div>


        <div ref={ref}>
          {isFetchingNextPage ? (
            <div> fetching... </div>
          ) : hasNextPage ? (
            <span>Load more...</span>
          ) : (
            <p>This is the end</p>
          )}
        </div>
      </div>
    </div>
  );
}
