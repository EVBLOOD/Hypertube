'use client';

import TitleCustom from '@/app/components/ui/titleCustom';
import styles from './page.module.css'
import InputCustom from '@/app/components/ui/inputCustom';
import RecordComponent from '@/app/components/ui/recordComponent';
import ButtonCustom from '@/app/components/ui/buttonCustom';

import Modal from '@/app/components/layout/modal';
import PopupCard from '@/app/components/layout/popupCard';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Register() {

    const Register =  useTranslations('Register')
    return (
        <Modal>
            <PopupCard
                childrenHelfCard={
                    <>
                        <RecordComponent />
                        <TitleCustom nb_color={2} title={Register('title')} className={styles.titleRegister} />
                        <span>
                            {Register('description')}
                        </span>
                    </>
                }
                widthchildrenHelfCard={35}
                widthchildrenSecondHelfCard={65}
                childrenSecondHelfCard={
                    <>
                        <div className={styles.registerInfos}>
                            <div className={styles.registerFullName}>
                                <InputCustom lableName={Register('label_first_name')} placeHolder={Register('holder_first_name')} />
                                <InputCustom lableName={Register('label_last_name')} placeHolder={Register('holder_last_name')} />
                            </div>
                                <InputCustom lableName={Register('label_user_name')} placeHolder={Register('holder_user_name')} />
                                <InputCustom lableName={Register('label_address')} placeHolder={Register('holder_address')} />
                                <InputCustom lableName={Register('label_pass')} placeHolder='••••••••••' typeInput='password' />
                            <div className={styles.passwordStringthContainer}>
                                <div className={styles.passwordStringth}>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                                <p>SOLID PASSWORD</p>
                            </div>
                        </div>


                        <div>
                            <ButtonCustom textButton='INITIALIZE SESSION' buttonImage={undefined} color="primary" />
                            <div className={styles.extraQs}>
                                {Register('ye_account')}
                                <Link href='/login'>{Register('access_account')}</Link>
                            </div>
                        </div>
                    </>
                }
            />
        </Modal>
    );
}
