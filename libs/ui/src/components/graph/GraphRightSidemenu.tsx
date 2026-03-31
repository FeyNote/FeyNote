import { Switch } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { InfoButton } from '../info/InfoButton';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { IoSettings, IoTrash, LuLock } from '../AppIcons';
import { FeynoteCard } from '../card/FeynoteCard';
import { FeynoteCardHeader } from '../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../card/FeynoteCardItem';
import { FeynoteCardItemEndSlot } from '../card/FeynoteCardItemEndSlot';
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
      <FeynoteCard>
        <FeynoteCardHeader>
          <IoSettings size={16} />
          <FeynoteCardHeaderLabel>{t('graph.settings')}</FeynoteCardHeaderLabel>
          <InfoButton
            message={t('graph.settings.help')}
            docsLink="https://docs.feynote.com/documents/graph/#graph-settings"
          />
        </FeynoteCardHeader>
        <FeynoteCardItem>
          {t('graph.settings.showOrphans')}
          <FeynoteCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphShowOrphans)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphShowOrphans, checked);
              }}
            />
          </FeynoteCardItemEndSlot>
        </FeynoteCardItem>
        <FeynoteCardItem>
          {t('graph.settings.showReferenceRelations')}
          <FeynoteCardItemEndSlot>
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
          </FeynoteCardItemEndSlot>
        </FeynoteCardItem>
        <FeynoteCardItem>
          {t('graph.settings.showTreeRelations')}
          <FeynoteCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphShowTreeRelations)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphShowTreeRelations, checked);
              }}
            />
          </FeynoteCardItemEndSlot>
        </FeynoteCardItem>
        <FeynoteCardItem>
          {t('graph.settings.lockNodeOnDrag')}
          <FeynoteCardItemEndSlot>
            <Switch
              checked={getPreference(PreferenceNames.GraphLockNodeOnDrag)}
              onCheckedChange={(checked) => {
                setPreference(PreferenceNames.GraphLockNodeOnDrag, checked);
              }}
            />
          </FeynoteCardItemEndSlot>
        </FeynoteCardItem>
      </FeynoteCard>
      {!!props.lockedArtifacts.length && (
        <FeynoteCard>
          <FeynoteCardHeader>
            <LuLock size={16} />
            <FeynoteCardHeaderLabel>
              {t('graph.settings.lockedArtifacts')}
            </FeynoteCardHeaderLabel>
            <InfoButton message={t('graph.settings.lockedArtifacts.help')} />
          </FeynoteCardHeader>
          {props.lockedArtifacts.map((artifact) => (
            <FeynoteCardItem key={artifact.id}>
              {artifact.title}
              <FeynoteCardItemEndSlot>
                <UnlockButton
                  onClick={(e) => {
                    e.stopPropagation();
                    props.unlockArtifact(artifact.id);
                  }}
                >
                  <IoTrash size={16} />
                </UnlockButton>
              </FeynoteCardItemEndSlot>
            </FeynoteCardItem>
          ))}
        </FeynoteCard>
      )}
    </>
  );
};
