"use client";

import { useTranslations } from "next-intl";
import type { MovieType } from "@/types/app";
import MovieCard from "../ui/movieCard";
import styles from "./continueWatchingSection.module.css";

export default function ContinueWatchingSection({ movies }: { movies?: MovieType[] }) {
    const Home = useTranslations("Home");

    if (!movies?.length) return null;

    return (
        <section className={`container ${styles.section}`}>
            <div className={styles.header}>
                <h2>{Home("continue_watching")}</h2>
                <span>{Home("continue_watching_subtitle")}</span>
            </div>
            <div className={styles.moviesList}>
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </section>
    );
}