import { IonCard, IonListHeader } from '@ionic/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { LuLayers } from '../AppIcons';

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
    <IonCard>
      <IonListHeader>
        <LuLayers size={16} />
        &nbsp;&nbsp;
        {t('rightSidemenu.workspaces')}
      </IonListHeader>
      {resolvedWorkspaces.length > 0 ? (
        resolvedWorkspaces.map((ws) => (
          <CompactIonItem key={ws.id} lines="none">
            <WorkspaceIconBubble
              icon={ws.meta.icon}
              color={ws.meta.color}
              size={20}
            />
            &nbsp;&nbsp;
            <NowrapIonLabel>
              {ws.meta.name || t('workspace.untitled')}
            </NowrapIonLabel>
          </CompactIonItem>
        ))
      ) : (
        <CompactIonItem lines="none">
          <NowrapIonLabel>{t('rightSidemenu.workspaces.none')}</NowrapIonLabel>
        </CompactIonItem>
      )}
    </IonCard>
  );
};
