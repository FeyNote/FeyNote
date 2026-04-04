import { Switch } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { IoSettings } from '../AppIcons';
import { FeynoteCard } from '../card/FeynoteCard';
import { FeynoteCardHeader } from '../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../card/FeynoteCardItem';
import { FeynoteCardItemEndSlot } from '../card/FeynoteCardItemEndSlot';

export const PersistentSearchRightSidemenu: React.FC = () => {
  const { t } = useTranslation();
  const { getPreference, setPreference } = usePreferencesContext();
  const searchAcrossAll = getPreference(
    PreferenceNames.GlobalSearchAcrossAllWorkspaces,
  );

  return (
    <FeynoteCard>
      <FeynoteCardHeader>
        <IoSettings size={16} />
        <FeynoteCardHeaderLabel>
          {t('persistentSearch.settings')}
        </FeynoteCardHeaderLabel>
      </FeynoteCardHeader>
      <FeynoteCardItem>
        {t('globalSearch.searchAllWorkspaces')}
        <FeynoteCardItemEndSlot>
          <Switch
            checked={searchAcrossAll}
            onCheckedChange={(checked) => {
              setPreference(
                PreferenceNames.GlobalSearchAcrossAllWorkspaces,
                checked,
              );
            }}
          />
        </FeynoteCardItemEndSlot>
      </FeynoteCardItem>
    </FeynoteCard>
  );
};
