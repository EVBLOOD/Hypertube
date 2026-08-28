"use client";

import { useTranslations } from "next-intl";
import DescriptionComponent from "../ui/descriptionComponent";
import styles from "./filter.module.css";
import { useEffect, useState } from "react";
import genreMessages from "@/messages/en.json";
import { useSearchParams } from "next/navigation";

export default function Filter({
    onChange,
}: {
    onChange: (newFilters: {
        genre: string;
        minYear: number;
        maxYear: number;
        minRating: number;
        sortBy: string;
        query: string;
        order: string;
    }) => void;
}) {
    const Library = useTranslations("Library");
    const geners = useTranslations("Genres");
    const genreKeys = Object.keys(genreMessages.Genres);
    const searchParams = useSearchParams();

    const [gender, setGender] = useState("all");
    const [minYear, setMinYear] = useState(2017);
    const [maxYear, setMaxYear] = useState(2026);
    const [rating, setRating] = useState(8);
    const [sortBy, setSortBy] = useState("title");
    const [order, setOrder] = useState("asc");
    const query = searchParams.get("search") || "";

    console.debug("Query from searchParams:", query);

    const [searchValue, setSearchValue] = useState(query);
    const sortOptions = [
        { id: "popularity", label: "filter_sort_popularity" },
        { id: "date", label: "filter_sort_add_date" },
        { id: "rating", label: "filter_sort_rating" },
        { id: "title", label: "filter_sort_alphabit" },
    ];

    // useEffect(() => {
    //     onChange({
    //         genre: gender,
    //         minYear,
    //         maxYear,
    //         minRating: rating,
    //         sortBy,
    //         order,
    //         query: searchValue,
    //     });
    //     console.log("Filters updated:", {
    //         genre: gender,
    //         minYear,
    //         maxYear,
    //         minRating: rating,
    //         sortBy,
    //         order,
    //         query: searchValue,
    //     });
    // }, [gender, minYear, maxYear, rating, sortBy, order, searchValue]);

    const handleChange = (
        props: {
            genre?: string;
            minYear?: number;
            maxYear?: number;
            minRating?: number;
            sortBy?: string;
            query?: string;
            order?: string;
        } = {},
    ) => {
        const newFilters = {
            genre: props.genre ?? gender,
            minYear: props.minYear ?? minYear,
            maxYear: props.maxYear ?? maxYear,
            minRating: props.minRating ?? rating,
            sortBy: props.sortBy ?? sortBy,
            order: props.order ?? order,
            query: props.query ?? searchValue,
        };

        onChange(newFilters);
        console.log("Filters updated:", newFilters);
    };

    useEffect(() => {
        setSearchValue(query);
    }, [query]);

    return (
        <div className={styles.filterWraper}>
            <DescriptionComponent
                className={styles.filterTitle}
                text={Library("filter_title")}
            />
            <div className={styles.inputHorisantal}>
                <label htmlFor="searchMovie">{Library("filter_search")}</label>
                <input
                    id="searchMovie"
                    placeholder={Library("filter_search_placeholder")}
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        handleChange({ query: e.target.value });
                    }}
                />
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor="genderId">{Library("filter_genre")}</label>
                <select
                    name=""
                    defaultValue={gender}
                    id="genderId"
                    required
                    onChange={(e) => {
                        setGender(e.target.value);
                        handleChange({ genre: e.target.value });
                    }}
                >
                    <option value="all">{Library("filter_allgenre")}</option>
                    {genreKeys.map((key) => (
                        <option key={key} value={key}>
                            {geners(key)}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor="genderId">
                    {Library("filter_production_year")}
                </label>
                <div className={styles.prodYear}>
                    <input
                        onChange={(e) => {
                            setMinYear(parseInt(e.target.value));
                            handleChange({ minYear: parseInt(e.target.value) });
                        }}
                        type="number"
                        value={minYear}
                    />
                    <input
                        onChange={(e) => {
                            setMaxYear(parseInt(e.target.value));
                            handleChange({ maxYear: parseInt(e.target.value) });
                        }}
                        type="number"
                        value={maxYear}
                    />
                </div>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor="genderId">{Library("filter_rating")}</label>
                <input
                    className={styles.mobileRating}
                    onChange={(e) => {
                        setRating(parseInt(e.target.value));
                        handleChange({ minRating: parseInt(e.target.value) });
                    }}
                    type="number"
                    value={rating}
                    min={0}
                    max={10}
                />
                <input
                    className={styles.desktopRating}
                    onChange={(e) => {
                        setRating(parseInt(e.target.value));
                        handleChange({ minRating: parseInt(e.target.value) });
                    }}
                    type="range"
                    min={0}
                    max={10}
                />
                <div className={styles.ratingDisplay}>
                    <span>0.0</span>
                    <span>{rating}.0</span>
                </div>
            </div>
            <div
                className={`${styles.inputHorisantal} ${styles.sortingForLabel}`}
            >
                <label htmlFor="genderId">{Library("filter_sortby")}</label>
                <ul>
                    {sortOptions.map((elem) => (
                        <li
                            onClick={() => {
                                if (sortBy === elem.id) {
                                    setOrder(order === "asc" ? "desc" : "asc");
                                } else {
                                    setOrder("asc");
                                }
                                handleChange({
                                    sortBy: elem.id,
                                    order:
                                        sortBy === elem.id
                                            ? order === "asc"
                                                ? "desc"
                                                : "asc"
                                            : "asc",
                                });
                                setSortBy(elem.id);
                            }}
                            key={elem.id}
                            className={
                                styles.noneSelectedSort +
                                " " +
                                (sortBy === elem.id && order === "asc"
                                    ? styles.selectedSortAsc
                                    : sortBy === elem.id && order === "desc"
                                      ? styles.selectedSortDesc
                                      : "")
                            }
                        >
                            {Library(elem.label)}
                        </li>
                    ))}
                </ul>
            </div>

            <div
                className={`${styles.inputHorisantal} ${styles.sortingForChices}`}
            >
                <select
                    name=""
                    defaultValue={sortBy}
                    required
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        handleChange({ sortBy: e.target.value });
                    }}
                >
                    {sortOptions.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                            {Library(obj.label)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
