
'use client';

import Filter from "@/app/components/layout/filter";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import MovieCard from "@/app/components/ui/movieCard";

export default function Library() {
  return (
    <div className={`container ${styles.browseContent}`}>
      <Filter/>
      <div className={styles.mainBrowseContent}>
        <div className={styles.mainBrowseContentHead}>
          <div>
            <TitleCustom title="THE BACKLOT" nb_color={-2}/>
            <DescriptionComponent text="INDEXED ASSETS // GLOBAL REPOSITORY"/>
          </div>
          <div className={styles.wrapperInfoSearch}>
            <div className={styles.infosSearch}>
                <DescriptionComponent text="RESOLUTION"/>
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
