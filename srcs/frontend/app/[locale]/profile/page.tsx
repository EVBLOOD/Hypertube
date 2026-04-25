import TitleCustom from '@/app/components/ui/titleCustom'
import styles from './page.module.css'
import DescriptionComponent from '@/app/components/ui/descriptionComponent'
import InputCustom from '@/app/components/ui/inputCustom'
import ButtonCustom from '@/app/components/ui/buttonCustom'
import CardInfosProfile from '@/app/components/ui/cardInfosProfile'
import CardStatsProfile from '@/app/components/ui/cardStatsProfile'
import ProfileSelectionInputs from '@/app/components/ui/profileSelectionInputs'
import InteractionProfileCard from '@/app/components/ui/interactionProfileCard'
import Link from 'next/link'
import TitleSectionProfile from '@/app/components/ui/titleSectionProfile'

export default function ProfilePage() {
    return (
        <div className={`container ${styles.browseContent}`}>
            <div className={styles.mainBrowseContentHead}>
                <div>
                    <TitleCustom title={'Director’s Office'} nb_color={-2} />
                    <DescriptionComponent text={'Live Connection Established // Data-Sync: Synchronized'} />
                </div>
            </div>

            <div className={styles.profileField}>
                {/* first part */}
                <div className={styles.firstPartHolder}>
                    {/* profile */}
                    <div className={styles.privateProfileSection}>
                        <div>
                            <TitleSectionProfile title='Private Settings' icon='/costumIcons/recent.svg' />

                        </div>
                        <div className={styles.personalInfosField}>
                            <div className={styles.profilePicture}>
                                <img className={styles.avatarProfile} src="/hero.png" alt="" width='128px' height='128px' />
                            </div>
                            <div className={styles.inputsholder}>
                                <InputCustom placeHolder='' lableName='Director Alias'></InputCustom>
                                <InputCustom placeHolder='' lableName='Secure Email'></InputCustom>
                            </div>

                        </div>
                        <ProfileSelectionInputs />
                        <ProfileSelectionInputs />

                        <ButtonCustom className={styles.submitChangesButton} textButton='COMMIT CHANGES' buttonImage={undefined} color='primary'></ButtonCustom>
                    </div>
                    {/* receent interactions */}
                    <div className={styles.privateProfileSection}>
                        <div className={styles.interactionTitleSection}>
                            <TitleSectionProfile title='Recent Intersections' icon='/costumIcons/recent.svg' />
                            <Link href="" className={styles.interactionsOpenMore}>View All Logs</Link>
                        </div>
                        <div className={styles.interactionsSection}>
                            <InteractionProfileCard />
                            <InteractionProfileCard />
                            <InteractionProfileCard />
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
                {/* second part */}
                <div className={styles.secondPartHolder}>
                    <CardInfosProfile />
                    <div className={styles.statisticCards}>
                        <CardStatsProfile />
                        <CardStatsProfile />
                    </div>
                    <div className={styles.statisticCards}>
                        <CardStatsProfile />
                        <CardStatsProfile />
                    </div>

                    <div className={styles.logsContainer}>
                        <h2>Security Logs</h2>
                        <div className={styles.SecurityLogs}>
                            <DescriptionComponent className={styles.discreptionRemoveMargin} text='LAST ACCESS: 192.168.1.45' />
                            <p  className={styles.discreptionRemoveMargin}>3m ago</p>
                        </div>
                        <div className={styles.SecurityLogs}>
                            <DescriptionComponent className={styles.discreptionRemoveMargin} text='DEVICE: WORKSTATION_01' />
                            <p  className={styles.discreptionRemoveMargin}>SECURE</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}