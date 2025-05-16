import {
  IonButton,
  IonCard,
  IonIcon,
  IonListHeader,
  IonToggle,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { lockClosed, settings, trash } from 'ionicons/icons';
import { InfoButton } from '../info/InfoButton';
import { CompactIonItem } from '../CompactIonItem';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';

interface Props {
  lockedArtifacts: {
    id: string;
    title: string;
  }[];
  unlockArtifact: (id: string) => void;
}

export const GraphRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { getPreference, setPreference } = usePreferencesContext();

  return (
    <>
      <IonCard>
        <IonListHeader>
          <IonIcon icon={settings} size="small" />
          &nbsp;&nbsp;
          {t('graph.settings')}
          <InfoButton message={t('graph.settings.help')} />
        </IonListHeader>
        <CompactIonItem>
          {t('graph.settings.showOrphans')}

          <IonToggle
            slot="end"
            onIonChange={(e) => {
              setPreference(PreferenceNames.GraphShowOrphans, e.detail.checked);
            }}
            checked={getPreference(PreferenceNames.GraphShowOrphans)} // Replace with your actual state
          ></IonToggle>
        </CompactIonItem>
        <CompactIonItem>
          {t('graph.settings.lockNodeOnDrag')}

          <IonToggle
            slot="end"
            onIonChange={(e) => {
              setPreference(
                PreferenceNames.GraphLockNodeOnDrag,
                e.detail.checked,
              );
            }}
            checked={getPreference(PreferenceNames.GraphLockNodeOnDrag)} // Replace with your actual state
          ></IonToggle>
        </CompactIonItem>
      </IonCard>
      {!!props.lockedArtifacts.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={lockClosed} size="small" />
            &nbsp;&nbsp;
            {t('graph.settings.lockedArtifacts')}
            <InfoButton message={t('graph.settings.lockedArtifacts.help')} />
          </IonListHeader>
          {props.lockedArtifacts.map((artifact) => (
            <CompactIonItem key={artifact.id}>
              {artifact.title}

              <IonButton
                slot="end"
                fill="clear"
                onClick={(e) => {
                  e.stopPropagation();
                  props.unlockArtifact(artifact.id);
                }}
              >
                <IonIcon slot="icon-only" icon={trash} />
              </IonButton>
            </CompactIonItem>
          ))}
        </IonCard>
      )}
    </>
  );
};
