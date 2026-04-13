
'use client';

import Filter from "@/app/components/layout/filter";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import MovieCard from "@/app/components/ui/movieCard";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Library() {
  const Library = useTranslations('Library')

  const [gender, setGender] = useState('')
  const [minYear, setMinYear] = useState(2017)
  const [maxYear, setMaxYear] = useState(2026)
  const [rating, setRating] = useState(8)
  const [sortBy, setSortBy] = useState('')

  function OnChange(gender: string, minYear: number, maxYear: number, rating: number, sortBy: string) {
    setGender(gender)
    setMinYear(minYear)
    setMaxYear(maxYear)
    setRating(rating)
    setSortBy(sortBy)
  }

  function moviesLibrary() {
    // api to call
  }

  return (
    <div className={`container ${styles.browseContent}`}>
      <Filter onChange={OnChange}/>
      <div className={styles.mainBrowseContent}>
        <div className={styles.mainBrowseContentHead}>
          <div>
            <TitleCustom title={Library('title')} nb_color={-2}/>
            <DescriptionComponent text={Library('sub_title')}/>
          </div>
          <div className={styles.wrapperInfoSearch}>
            <div className={styles.infosSearch}>
                <DescriptionComponent text={Library('resolution')}/>
                <p  style={{color: "var(--primary-color)"}}>4K ULTRA HD</p>
            </div>
          </div>
        </div>
        <div className={styles.moviesList}>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
          <MovieCard></MovieCard>
        </div>
      </div>
    </div>
  );
}
