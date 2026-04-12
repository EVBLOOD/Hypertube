"use client";

import HeroSectionMovie from "@/app/components/layout/heroSectionMovie";
import { use } from "react";
import styles from './page.module.css'
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";


export default function MoviePage({ params }: { params: Promise<{ id: number }> }) {

    const resolvedParams = use(params)
    const id = resolvedParams.id

    // I should cheack if the number is number // later to do

    return (
        <div>
            <HeroSectionMovie />
            <div style={{backgroundColor: '#131313'}} >
                <div className="container">
                    <div className={styles.productionWraper}>
                        <div className={styles.productionLogTitleDeco}></div>
                        <TitleCustom title="PRODUCTION LOGS" nb_color={-2} className={styles.productionLogTitle}/>
                    </div>
                    <div className={styles.productionLogElements}>
                        <div className={styles.productionLogCard}>
                            <span style={{color: "var(--primary-color)", letterSpacing: '5px'}}>
                                Director
                            </span>
                            <h2>
                                Saad AKLLAM
                            </h2>
                            <DescriptionComponent text="The visionary behind 'Static Dreams' and 'Neon Ghost'."></DescriptionComponent>
                        </div>

                        <div className={styles.productionLogCard}>
                            <span style={{color: "var(--primary-color)", letterSpacing: '5px'}}>
                                Director
                            </span>
                            <h2>
                                Saad AKLLAM
                            </h2>
                            <DescriptionComponent text="The visionary behind 'Static Dreams' and 'Neon Ghost'."></DescriptionComponent>
                        </div>

                        <div className={styles.productionLogCard}>
                            <span style={{color: "var(--primary-color)", letterSpacing: '5px'}}>
                                Director
                            </span>
                            <h2>
                                Saad AKLLAM
                            </h2>
                            <DescriptionComponent text="The visionary behind 'Static Dreams' and 'Neon Ghost'."></DescriptionComponent>
                        </div>

                        <div className={styles.productionLogCard}>
                            <span style={{color: "var(--primary-color)", letterSpacing: '5px'}}>
                                Director
                            </span>
                            <h2>
                                Saad AKLLAM
                            </h2>
                            <DescriptionComponent text="The visionary behind 'Static Dreams' and 'Neon Ghost'."></DescriptionComponent>
                        </div>    
                    </div>
                    <div>
                        <h4></h4>
                    </div>
                </div>
            </div>
            <div>
                // comment section
            </div>
        </div>
    )
}