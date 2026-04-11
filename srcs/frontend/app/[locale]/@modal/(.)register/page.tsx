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
import { useRef } from 'react';
import AuthService from '@/lib/services/AuthService';

export default function Register() {
    const Register =  useTranslations('Register')

    const firstnameRef = useRef<HTMLInputElement>(null)
    const lastnameRef = useRef<HTMLInputElement>(null)
    const usernameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    async function handelRegister() {
        const firstname = firstnameRef.current?.value;
        const lastname = lastnameRef.current?.value;
        const username = usernameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if (!firstname || !lastname || !username || !email || !password) return

        try {
            const result = await AuthService.register({firstName: firstname, lastName: lastname, username, email, password})
            console.log(result)
        } catch (err) {
            console.debug(err)
        }
    }
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
                                <InputCustom ref={firstnameRef} lableName={Register('label_first_name')} placeHolder={Register('holder_first_name')} />
                                <InputCustom ref={lastnameRef} lableName={Register('label_last_name')} placeHolder={Register('holder_last_name')} />
                            </div>
                                <InputCustom ref={usernameRef} lableName={Register('label_user_name')} placeHolder={Register('holder_user_name')} />
                                <InputCustom ref={emailRef} lableName={Register('label_address')} placeHolder={Register('holder_address')} />
                                <InputCustom ref={passwordRef} lableName={Register('label_pass')} placeHolder='••••••••••' typeInput='password' />
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
                            <ButtonCustom onClick={handelRegister} textButton='INITIALIZE SESSION' buttonImage={undefined} color="primary" />
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
