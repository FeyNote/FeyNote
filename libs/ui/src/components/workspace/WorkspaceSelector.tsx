import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonLabel } from '@ionic/react';
import { DropdownMenu } from '@radix-ui/themes';
import styled from 'styled-components';
import { IoAdd } from '../AppIcons';
import { IoChevronDown } from '../AppIcons';
import { FaPencil } from '../AppIcons';
import { LuLayers } from '../AppIcons';
import { CompactIonItem } from '../CompactIonItem';
import { getWorkspaceAccessLevel } from '@feynote/shared-utils';
import { useSessionContext } from '../../context/session/SessionContext';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useAcceptedIncomingSharedWorkspaceIds } from '../../utils/workspace/useAcceptedIncomingSharedWorkspaceIds';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { WorkspaceCreateModal } from './WorkspaceCreateModal';
import { WorkspaceEditModal } from './WorkspaceEditModal';

const WorkspaceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  margin-left: auto;
  color: var(--text-color);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`;

const CreateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface Props {
  onWorkspaceChange?: () => void;
}

export const WorkspaceSelector: React.FC<Props> = ({ onWorkspaceChange }) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { workspaceSnapshots: allWorkspaceSnapshots } = useWorkspaceSnapshots();
  const { currentWorkspaceId, setCurrentWorkspaceId } = useCurrentWorkspaceId();
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { acceptedIncomingSharedWorkspaceIds } =
    useAcceptedIncomingSharedWorkspaceIds(connection.yjsDoc);

  const workspaceSnapshots = useMemo(() => {
    return allWorkspaceSnapshots.filter(
      (ws) =>
        ws.meta.userId === session.userId ||
        acceptedIncomingSharedWorkspaceIds.has(ws.id),
    );
  }, [
    allWorkspaceSnapshots,
    session.userId,
    acceptedIncomingSharedWorkspaceIds,
  ]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState<string | null>(null);

  const currentWorkspace = currentWorkspaceId
    ? workspaceSnapshots.find((ws) => ws.id === currentWorkspaceId)
    : null;

  const handleSelect = (workspaceId: string | null) => {
    setCurrentWorkspaceId(workspaceId);
    onWorkspaceChange?.();
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <CompactIonItem lines="none" button>
            {currentWorkspace ? (
              <>
                <WorkspaceIconBubble
                  icon={currentWorkspace.meta.icon}
                  color={currentWorkspace.meta.color}
                  size={18}
                />
                &nbsp;&nbsp;
                <IonLabel>
                  {currentWorkspace.meta.name || t('workspace.untitled')}
                </IonLabel>
              </>
            ) : (
              <>
                <LuLayers
                  size={18}
                  color="rgba(var(--ion-text-color-rgb, 0, 0, 0), 0.54)"
                />
                &nbsp;&nbsp;
                <IonLabel>{t('workspace.everything')}</IonLabel>
              </>
            )}
            &nbsp;
            <IoChevronDown size={12} />
          </CompactIonItem>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content style={{ minWidth: 250 }}>
          <DropdownMenu.Item onClick={() => handleSelect(null)}>
            <WorkspaceRow>
              <LuLayers size={18} />
              {t('workspace.everything')}
            </WorkspaceRow>
          </DropdownMenu.Item>
          {workspaceSnapshots.length > 0 && <DropdownMenu.Separator />}
          {workspaceSnapshots.map((ws) => (
            <DropdownMenu.Item key={ws.id} onClick={() => handleSelect(ws.id)}>
              <WorkspaceRow>
                <WorkspaceIconBubble
                  icon={ws.meta.icon}
                  color={ws.meta.color}
                  size={22}
                />
                {ws.meta.name || t('workspace.untitled')}
                {getWorkspaceAccessLevel(ws, session.userId) === 'coowner' && (
                  <EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditWorkspaceId(ws.id);
                    }}
                  >
                    <FaPencil size={12} />
                  </EditButton>
                )}
              </WorkspaceRow>
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setCreateModalOpen(true)}>
            <CreateRow>
              <IoAdd />
              {t('workspace.create')}
            </CreateRow>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <WorkspaceCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={(workspaceId) => {
          setCurrentWorkspaceId(workspaceId);
        }}
      />

      {editWorkspaceId && (
        <WorkspaceEditModal
          workspaceId={editWorkspaceId}
          open={!!editWorkspaceId}
          onOpenChange={(open) => {
            if (!open) setEditWorkspaceId(null);
          }}
          onDeleted={() => {
            if (currentWorkspaceId === editWorkspaceId) {
              setCurrentWorkspaceId(null);
            }
            setEditWorkspaceId(null);
          }}
        />
      )}
    </>
  );
};
