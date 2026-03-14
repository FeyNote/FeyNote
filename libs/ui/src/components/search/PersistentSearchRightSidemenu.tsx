import { IonCard, IonListHeader, IonIcon, IonToggle } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { settings } from 'ionicons/icons';
import { CompactIonItem } from '../CompactIonItem';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';

export const PersistentSearchRightSidemenu: React.FC = () => {
  const { t } = useTranslation();
  const { getPreference, setPreference } = usePreferencesContext();
  const searchAcrossAll = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );

  return (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={settings} size="small" />
        &nbsp;&nbsp;
        {t('persistentSearch.settings')}
      </IonListHeader>
      <CompactIonItem>
        {t('globalSearch.searchAllWorkspaces')}
        <IonToggle
          slot="end"
          onIonChange={(e) => {
            setPreference(
              PreferenceNames.GlobalSearchAcrossAllWorkspaces,
              e.detail.checked,
            );
          }}
          checked={searchAcrossAll}
        />
      </CompactIonItem>
    </IonCard>
  );
};
