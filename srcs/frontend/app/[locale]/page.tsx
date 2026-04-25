'use client';

import HeroSection from "../components/layout/heroSection";
import TrandingSection from "../components/layout/trandingSection";

import { useMovieHero } from '@/lib/dataHooks/moviesHero';
import { useCuratedMovies } from '@/lib/dataHooks/curatedMovies';

import LoadingPage from "../components/layout/loading";
import ErrorPage from "../components/layout/error";
import { AxiosError } from "axios";


export default function Home() {
  const { data: hero, isPending: hero_pending, error: hero_error } = useMovieHero()
  const { data: topFour, isPending: topFour_pending, error: topFour_error, } = useCuratedMovies()

  if (hero_pending || topFour_pending)
    return <LoadingPage />

  if (hero_error || topFour_error) {
    const heroAxiosError = hero_error as AxiosError<any>;
    const topFourAxiosError = topFour_error as AxiosError<any>;

    return <ErrorPage errorMessage={heroAxiosError?.response?.data?.message || topFourAxiosError?.response?.data?.message || "Something went wrong"} errorCode={heroAxiosError?.response?.status || topFourAxiosError?.response?.status || 404}></ErrorPage>
  }

  return (
    <div>
      <HeroSection movie={hero?.data} />
      <TrandingSection movies={topFour?.data} />
    </div>)
}
