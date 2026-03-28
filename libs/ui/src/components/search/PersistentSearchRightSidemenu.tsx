import { Switch } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { IoSettings } from '../AppIcons';
import {
  SidemenuCard,
  SidemenuCardHeader,
  SidemenuCardHeaderLabel,
  SidemenuCardItem,
  SidemenuCardItemEndSlot,
} from '../sidemenu/SidemenuComponents';

export const PersistentSearchRightSidemenu: React.FC = () => {
  const { t } = useTranslation();
  const { getPreference, setPreference } = usePreferencesContext();
  const searchAcrossAll = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );

  return (
    <SidemenuCard>
      <SidemenuCardHeader>
        <IoSettings size={16} />
        <SidemenuCardHeaderLabel>
          {t('persistentSearch.settings')}
        </SidemenuCardHeaderLabel>
      </SidemenuCardHeader>
      <SidemenuCardItem>
        {t('globalSearch.searchAllWorkspaces')}
        <SidemenuCardItemEndSlot>
          <Switch
            checked={searchAcrossAll}
            onCheckedChange={(checked) => {
              setPreference(
                PreferenceNames.GlobalSearchAcrossAllWorkspaces,
                checked,
              );
            }}
          />
        </SidemenuCardItemEndSlot>
      </SidemenuCardItem>
    </SidemenuCard>
  );
};
