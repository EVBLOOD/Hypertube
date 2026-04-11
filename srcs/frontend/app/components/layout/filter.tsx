'use client';

import DescriptionComponent from '../ui/descriptionComponent';
import styles from './filter.module.css'

export default function Filter() {
    return (
        <div className={styles.filterWraper}>
            <DescriptionComponent text="ARCHIVE FILTERS" />
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>GENRE</label>
                <select name="" defaultValue="" id="genderId" required>
                    <option value="" disabled hidden>ALL GENRES</option>
                    <option value="2">option</option>
                    <option value="3">option</option>
                </select>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>PRODUCTION YEAR</label>
                <div className={styles.prodYear}>
                    <input type="number" value={2017} />
                    <input type="number" value={2026} />
                </div>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>MINIMUM RATING (IMDb)</label>
                <input type="range" min={0} max={10} />
                <div>
                    <span>0.0</span>
                    <span>10.0</span>
                </div>
            </div>
            <div className={styles.inputHorisantal}>
                <label htmlFor='genderId'>SORT BY</label>
                <ul>
                    <li className={styles.noneSelectedSort + ' ' + styles.selectedSort}>
                        SEEDS/PEER COUNT
                    </li>
                    <li className={styles.noneSelectedSort}>
                        DATE ADDED
                    </li>
                    <li className={styles.noneSelectedSort}>
                        ALPHABETICAL
                    </li>
                </ul>
            </div>
        </div>
    )
}