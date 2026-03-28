import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { LuLayers } from '../AppIcons';
import {
  SidemenuCard,
  SidemenuCardHeader,
  SidemenuCardHeaderLabel,
  SidemenuCardItem,
  SidemenuCardItemLabel,
} from '../sidemenu/SidemenuComponents';

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
    <SidemenuCard>
      <SidemenuCardHeader>
        <LuLayers size={16} />
        <SidemenuCardHeaderLabel>
          {t('rightSidemenu.workspaces')}
        </SidemenuCardHeaderLabel>
      </SidemenuCardHeader>
      {resolvedWorkspaces.length > 0 ? (
        resolvedWorkspaces.map((ws) => (
          <SidemenuCardItem key={ws.id}>
            <WorkspaceIconBubble
              icon={ws.meta.icon}
              color={ws.meta.color}
              size={20}
            />
            &nbsp;&nbsp;
            <SidemenuCardItemLabel>
              {ws.meta.name || t('workspace.untitled')}
            </SidemenuCardItemLabel>
          </SidemenuCardItem>
        ))
      ) : (
        <SidemenuCardItem>
          <SidemenuCardItemLabel>
            {t('rightSidemenu.workspaces.none')}
          </SidemenuCardItemLabel>
        </SidemenuCardItem>
      )}
    </SidemenuCard>
  );
};
