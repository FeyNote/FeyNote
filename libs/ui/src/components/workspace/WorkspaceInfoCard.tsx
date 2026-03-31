import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { LuLayers } from '../AppIcons';
import { FeynoteCard } from '../card/FeynoteCard';
import { FeynoteCardHeader } from '../card/FeynoteCardHeader';
import { FeynoteCardHeaderLabel } from '../card/FeynoteCardHeaderLabel';
import { FeynoteCardItem } from '../card/FeynoteCardItem';
import { FeynoteCardItemLabel } from '../card/FeynoteCardItemLabel';

interface Props {
  workspaceIds: string[];
}

export const WorkspaceInfoCard: React.FC<Props> = ({ workspaceIds }) => {
  const { t } = useTranslation();
  const { workspaceSnapshots, getWorkspaceSnapshotById } =
    useWorkspaceSnapshots();

  const resolvedWorkspaces = useMemo(() => {
    return workspaceIds
      .map((id) => {
        const ws = getWorkspaceSnapshotById(id);
        if (!ws || ws.meta.deletedAt) return undefined;
        return ws;
      })
      .filter((el) => !!el);
  }, [workspaceIds, getWorkspaceSnapshotById]);

  if (!workspaceSnapshots.length) return null;

  return (
    <FeynoteCard>
      <FeynoteCardHeader>
        <LuLayers size={16} />
        <FeynoteCardHeaderLabel>
          {t('rightSidemenu.workspaces')}
        </FeynoteCardHeaderLabel>
      </FeynoteCardHeader>
      {resolvedWorkspaces.length > 0 ? (
        resolvedWorkspaces.map((ws) => (
          <FeynoteCardItem key={ws.id}>
            <WorkspaceIconBubble
              icon={ws.meta.icon}
              color={ws.meta.color}
              size={20}
            />
            &nbsp;&nbsp;
            <FeynoteCardItemLabel>
              {ws.meta.name || t('workspace.untitled')}
            </FeynoteCardItemLabel>
          </FeynoteCardItem>
        ))
      ) : (
        <FeynoteCardItem>
          <FeynoteCardItemLabel>
            {t('rightSidemenu.workspaces.none')}
          </FeynoteCardItemLabel>
        </FeynoteCardItem>
      )}
    </FeynoteCard>
  );
};
