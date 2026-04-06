import TitleCustom from '@/app/components/ui/titleCustom';
import styles from './page.module.css'
import InputCustom from '@/app/components/ui/inputCustom';
import RecordComponent from '@/app/components/ui/recordComponent';
import SceneCustom from '@/app/components/ui/sceneCustom';
import ButtonCustom from '@/app/components/ui/buttonCustom';

export default function Login() {
  return (
    <div className={styles.card}>
      <div className={styles.halfCard}>
        <RecordComponent />
        <TitleCustom title='READY TO STREAM?'/>
        <span>
          Access the world's most comprehensive vault of cinematic high-definition content. One click to action.
        </span>
        <div>
          <SceneCustom sceneNumber='SCENE: 01' sceneName='GLOBAL_AUTH'/>
          <SceneCustom sceneNumber='TAKE: 04' sceneName='TORRENT_CORE'/>
        </div>
        <div className={styles.buttonSpace}>
          <div>Integrate with secure providers</div>
          <ButtonCustom textButton='CONTINUE WITH 42 NETWORK' buttonImage='/costumIcons/42icon.svg'></ButtonCustom>
          <ButtonCustom textButton='CONTINUE WITH 42 NETWORK' buttonImage='/costumIcons/42icon.svg'></ButtonCustom>
        </div>
      </div>
      <div className={`${styles.halfCard} ${styles.secondHalf}`}>
        <div>
          <h1>
            IDENTIFICATION
          </h1>
          <div>
            Please provide credentials to enter the vault.
          </div>
        </div>

        <div className={styles.loginInfos}>
          <InputCustom lableName='EMAIL_ADDRESS' placeHolder='USER@DOMAIN.COM'/>
          <InputCustom lableName='PASS_CODE' placeHolder='••••••••••' typeInput='password' />
          <div className={styles.recoverPassword}>
            <p>Recover_Lost_Key?</p>
          </div>
        </div>
        <div>
          <ButtonCustom textButton='AUTHORIZE_ACCESS' buttonImage={undefined} color="primary"/>
          <div>
            NO KEY YET?
            <span>ENROLL_HERE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
