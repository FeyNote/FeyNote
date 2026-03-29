import { Switch } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { IoSettings, IoTrash, LuLock } from '../AppIcons';
import {
  SidemenuCard,
  SidemenuCardHeader,
  SidemenuCardHeaderLabel,
  SidemenuCardItem,
  SidemenuCardItemEndSlot,
} from '../sidemenu/SidemenuComponents';
import styled from 'styled-components';

const UnlockButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-color-dim);

  &:hover {
    background: var(--gray-a3);
  }
`;

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
      <SidemenuCard>
        <SidemenuCardHeader>
          <IoSettings size={16} />
          <SidemenuCardHeaderLabel>
            {t('graph.settings')}
          </SidemenuCardHeaderLabel>
          <InfoButton
            message={t('graph.settings.help')}
            docsLink="https://docs.feynote.com/documents/graph/#graph-settings"
          />
        </SidemenuCardHeader>
        <SidemenuCardItem>
          {t('graph.settings.showOrphans')}
          <SidemenuCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphShowOrphans)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphShowOrphans, checked);
              }}
            />
          </SidemenuCardItemEndSlot>
        </SidemenuCardItem>
        <SidemenuCardItem>
          {t('graph.settings.showReferenceRelations')}
          <SidemenuCardItemEndSlot>
            <Switch
              checked={getPreference(
                PreferenceNames.GraphShowReferenceRelations,
              )}
              onCheckedChange={(checked) => {
                setPreference(
                  PreferenceNames.GraphShowReferenceRelations,
                  checked,
                );
              }}
            />
          </SidemenuCardItemEndSlot>
        </SidemenuCardItem>
        <SidemenuCardItem>
          {t('graph.settings.showTreeRelations')}
          <SidemenuCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphShowTreeRelations)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphShowTreeRelations, checked);
              }}
            />
          </SidemenuCardItemEndSlot>
        </SidemenuCardItem>
        <SidemenuCardItem>
          {t('graph.settings.lockNodeOnDrag')}
          <SidemenuCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphLockNodeOnDrag)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphLockNodeOnDrag, checked);
              }}
            />
          </SidemenuCardItemEndSlot>
        </SidemenuCardItem>
      </SidemenuCard>
      {!!props.lockedArtifacts.length && (
        <SidemenuCard>
          <SidemenuCardHeader>
            <LuLock size={16} />
            <SidemenuCardHeaderLabel>
              {t('graph.settings.lockedArtifacts')}
            </SidemenuCardHeaderLabel>
            <InfoButton message={t('graph.settings.lockedArtifacts.help')} />
          </SidemenuCardHeader>
          {props.lockedArtifacts.map((artifact) => (
            <SidemenuCardItem key={artifact.id}>
              {artifact.title}
              <SidemenuCardItemEndSlot>
                <UnlockButton
                  onClick={(e) => {
                    e.stopPropagation();
                    props.unlockArtifact(artifact.id);
                  }}
                >
                  <IoTrash size={16} />
                </UnlockButton>
              </SidemenuCardItemEndSlot>
            </SidemenuCardItem>
          ))}
        </SidemenuCard>
      )}
    </>
  );
};
