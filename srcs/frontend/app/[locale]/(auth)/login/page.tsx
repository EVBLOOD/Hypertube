import TitleCustom from '@/app/components/ui/titleCustom';
import styles from './page.module.css'
import InputCustom from '@/app/components/ui/inputCustom';
import RecordComponent from '@/app/components/ui/recordComponent';
import SceneCustom from '@/app/components/ui/sceneCustom';
import ButtonCustom from '@/app/components/ui/buttonCustom';

import { getTranslations } from 'next-intl/server';

export default async function Login() {
  const Login = await getTranslations('Login')
  return (
    <div className={styles.card}>
      <div className={styles.halfCard}>
        <RecordComponent />
        <TitleCustom title={Login('title')}/>
        <span>
          {Login('description')}
        </span>
        <div>
          {
          Login.raw('scenes').map((scene: {number: string, name: string}, index: number) =>
            <SceneCustom key={index} sceneNumber={scene.number} sceneName={scene.name}/>)
          }
        </div>
        <div className={styles.buttonSpace}>
          <div>{Login('integration')}</div>
          <ButtonCustom textButton={Login.raw('integrations')[0]} buttonImage='/costumIcons/42icon.svg'></ButtonCustom>
          <ButtonCustom textButton={Login.raw('integrations')[1]} buttonImage='/costumIcons/42icon.svg'></ButtonCustom>
        </div>
      </div>
      <div className={`${styles.halfCard} ${styles.secondHalf}`}>
        <div>
          <h1>
            {Login('second_title')}
          </h1>
          <div>
            {Login('second_discreption')}
          </div>
        </div>

        <div className={styles.loginInfos}>
          <InputCustom lableName={Login('label_address')} placeHolder={Login('label_address')}/>
          <InputCustom lableName={Login('label_pass')} placeHolder='••••••••••' typeInput='password' />
          <div className={styles.recoverPassword}>
            <p>{Login('forgot_pass')}</p>
          </div>
        </div>
        <div>
          <ButtonCustom textButton='AUTHORIZE_ACCESS' buttonImage={undefined} color="primary"/>
          <div>
            {Login('no_account')}
            <span>{Login('create_account')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
