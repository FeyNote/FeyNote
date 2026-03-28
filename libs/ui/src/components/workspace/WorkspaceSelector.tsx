import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from '@radix-ui/themes';
import styled from 'styled-components';
import { IoAdd } from '../AppIcons';
import { IoChevronDown } from '../AppIcons';
import { FaPencil } from '../AppIcons';
import { LuLayers } from '../AppIcons';
import { getWorkspaceAccessLevel } from '@feynote/shared-utils';
import { useSessionContext } from '../../context/session/SessionContext';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useAcceptedIncomingSharedWorkspaceIds } from '../../utils/workspace/useAcceptedIncomingSharedWorkspaceIds';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { WorkspaceCreateModal } from './WorkspaceCreateModal';
import { WorkspaceEditModal } from './WorkspaceEditModal';
import { WorkspaceSharedInfoModal } from './WorkspaceSharedInfoModal';

const SelectorTrigger = styled.div`
  display: flex;
  align-items: center;
  min-height: 34px;
  font-size: 0.875rem;
  padding: 0 16px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--text-color);

  &:hover {
    background: var(--contrasting-element-background-hover);
  }
`;

const SelectorIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 18px;
  color: var(--text-color-dim);
`;

const SelectorLabel = styled.span`
  margin-left: 8px;
  flex: 1;
`;

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
  const [sharedInfoWorkspaceId, setSharedInfoWorkspaceId] = useState<
    string | null
  >(null);

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
          <SelectorTrigger>
            {currentWorkspace ? (
              <>
                <WorkspaceIconBubble
                  icon={currentWorkspace.meta.icon}
                  color={currentWorkspace.meta.color}
                  size={18}
                />
                <SelectorLabel>
                  {currentWorkspace.meta.name || t('workspace.untitled')}
                </SelectorLabel>
              </>
            ) : (
              <>
                <SelectorIcon>
                  <LuLayers size={18} />
                </SelectorIcon>
                <SelectorLabel>{t('workspace.everything')}</SelectorLabel>
              </>
            )}
            <IoChevronDown size={12} />
          </SelectorTrigger>
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
                <EditButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      getWorkspaceAccessLevel(ws, session.userId) === 'coowner'
                    ) {
                      setEditWorkspaceId(ws.id);
                    } else {
                      setSharedInfoWorkspaceId(ws.id);
                    }
                  }}
                >
                  <FaPencil size={12} />
                </EditButton>
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

      {sharedInfoWorkspaceId && (
        <WorkspaceSharedInfoModal
          workspaceId={sharedInfoWorkspaceId}
          open={!!sharedInfoWorkspaceId}
          onOpenChange={(open) => {
            if (!open) setSharedInfoWorkspaceId(null);
          }}
          onLeft={() => {
            if (currentWorkspaceId === sharedInfoWorkspaceId) {
              setCurrentWorkspaceId(null);
            }
            setSharedInfoWorkspaceId(null);
          }}
        />
      )}
    </>
  );
};
