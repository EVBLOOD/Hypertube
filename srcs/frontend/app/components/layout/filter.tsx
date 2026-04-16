'use client';

import { useTranslations } from 'next-intl';
import DescriptionComponent from '../ui/descriptionComponent';
import styles from './filter.module.css'
import { useEffect, useState } from 'react';
import genreMessages from '@/messages/en.json';

export default function Filter({ onChange }: { onChange: Function }) {
    const Library = useTranslations('Library')
    const geners = useTranslations('Genres');
    const genreKeys = Object.keys(genreMessages.Genres)


    const [gender, setGender] = useState('all')
    const [minYear, setMinYear] = useState(2017)
    const [maxYear, setMaxYear] = useState(2026)
    const [rating, setRating] = useState(8)
    const [sortBy, setSortBy] = useState('alpha')

    const sortOptions = [
        { id: 'views', label: 'filter_sort_views_count' },
        { id: 'date', label: 'filter_sort_add_date' },
        { id: 'alpha', label: 'filter_sort_alphabit' }
    ];

    useEffect(() => {
        onChange({
            genre: gender,
            minYear,
            maxYear,
            minRating: rating,
            sortBy
        });
    }, [gender, minYear, maxYear, rating, sortBy]);

    return (
        <div className={styles.filterWraper}>
            <DescriptionComponent text={Library('filter_title')} />
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>{Library('filter_genre')}</label>
                <select name="" defaultValue={gender} id="genderId" required onChange={(e) => { setGender(e.target.value); }}>
                    <option value="all">{Library('filter_allgenre')}</option>
                    {genreKeys.map((key) => <option key={key} value={key}>{geners(key)}</option>)}
                </select>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>{Library('filter_production_year')}</label>
                <div className={styles.prodYear}>
                    <input onChange={(e) => { setMinYear(parseInt(e.target.value)); }} type="number" value={minYear} />
                    <input onChange={(e) => { setMaxYear(parseInt(e.target.value)); }} type="number" value={maxYear} />
                </div>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>{Library('filter_rating')}</label>
                <input onChange={(e) => { setRating(parseInt(e.target.value)); }} type="range" min={0} max={10} />
                <div>
                    <span>0.0</span>
                    {/* <span style={{textDecoration: 'underline'}}>{rating}</span>
                    <span>10.0</span> */}
                    <span>{rating}.0</span>
                </div>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>{Library('filter_sortby')}</label>
                <ul>
                    {
                        sortOptions.map((elem) =>
                            <li onClick={() => { setSortBy(elem.id); }} key={elem.id} className={styles.noneSelectedSort + " " + (sortBy === elem.id ? styles.selectedSort : '')}>
                                {Library(elem.label)}
                            </li>)
                    }
                </ul>
            </div>
        </div>
    )
}