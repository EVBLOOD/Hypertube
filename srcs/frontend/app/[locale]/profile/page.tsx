import TitleCustom from '@/app/components/ui/titleCustom'
import styles from './page.module.css'
import DescriptionComponent from '@/app/components/ui/descriptionComponent'
import InputCustom from '@/app/components/ui/inputCustom'
import ButtonCustom from '@/app/components/ui/buttonCustom'

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
                            <h2>Private Settings</h2>
                        </div>
                        <div className={styles.personalInfosField}>
                            <div className={styles.profilePicture}>
                                <img src="/hero.png" alt="" width='120px' height='120px' style={{ borderStyle: 'dashed' }} />
                            </div>
                            <div className={styles.inputsholder}>
                                <InputCustom placeHolder='' lableName='Director Alias'></InputCustom>
                                <InputCustom placeHolder='' lableName='Secure Email'></InputCustom>
                            </div>

                        </div>
                        <div>
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
                        </div>

                        <ButtonCustom textButton='COMMIT CHANGES' buttonImage={undefined}></ButtonCustom>
                    </div>
                    {/* receent interactions */}
                    <div>

                    </div>
                </div>
                {/* second part */}
                <div>
                    sss

                </div>
            </div>
        </div>
    )
}