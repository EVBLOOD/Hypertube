'use client';

import HeroSection from "../components/layout/heroSection";
import TrandingSection from "../components/layout/trandingSection";

import { useMovieHero } from '@/lib/dataHooks/moviesHero';
import { useCuratedMovies } from '@/lib/dataHooks/curatedMovies';

import LoadingPage from "../components/layout/loading";


export default function Home() {
  const { data: hero, isPending: hero_pending, error: hero_error } = useMovieHero()
  const {data: topFour,isPending: topFour_pending, error: topFour_error} =  useCuratedMovies()

  if (hero_pending && topFour_pending)
    return <LoadingPage />
  if (hero_error || topFour_error) {
    console.log(hero_error)
    console.log(topFour_error)
  }
  return (
    <div>
      <HeroSection movie={hero?.data}/>
      <TrandingSection movies={topFour?.data} />
    </div>)
}
