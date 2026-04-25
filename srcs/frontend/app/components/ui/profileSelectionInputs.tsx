'use client';

import DescriptionComponent from './descriptionComponent';
import styles from './profileSelectionInputs.module.css'

export default function ProfileSelectionInputs() {
    return (
        <div className={styles.selectionsSections}>
            <div>
                <h3 style={{ margin: 0 }}>Public Preview</h3>
                <DescriptionComponent text='Hide primary email address from community members' />
            </div>
            <div className={styles.buttonOnOff}>
                <span></span>
                <span></span>
            </div>
        </div>
    )
}