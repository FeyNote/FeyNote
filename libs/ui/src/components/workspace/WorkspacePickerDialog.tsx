import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { WorkspaceIconBubble } from './WorkspaceIconBubble';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { useSessionContext } from '../../context/session/SessionContext';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useAcceptedIncomingSharedWorkspaceIds } from '../../utils/workspace/useAcceptedIncomingSharedWorkspaceIds';

const WorkspaceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
`;

const WorkspaceItem = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 2px solid
    ${(props) => (props.$selected ? 'var(--ion-color-primary)' : 'transparent')};
  border-radius: 8px;
  background: var(--general-background);
  cursor: pointer;
  color: var(--text-color);

  &:hover {
    background-color: var(--general-background-hover);
  }
`;

const WorkspaceName = styled.span`
  font-size: 0.875rem;
`;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (workspaceId: string) => void;
  excludeWorkspaceIds?: ReadonlySet<string>;
  mustBeEditable?: boolean;
  title?: string;
}

export const WorkspacePickerDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const useWorkspaceSnapshotsResult = useWorkspaceSnapshots();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { acceptedIncomingSharedWorkspaceIds } =
    useAcceptedIncomingSharedWorkspaceIds(connection.yjsDoc);

  const allWorkspaceSnapshots = props.mustBeEditable
    ? useWorkspaceSnapshotsResult.editableWorkspaceSnapshots
    : useWorkspaceSnapshotsResult.workspaceSnapshots;

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

  const filteredWorkspaces = useMemo(() => {
    return props.excludeWorkspaceIds
      ? workspaceSnapshots.filter(
          (ws) => !props.excludeWorkspaceIds?.has(ws.id),
        )
      : workspaceSnapshots;
  }, [props.excludeWorkspaceIds, workspaceSnapshots]);

  const handleConfirm = () => {
    if (selectedId) {
      props.onSelect(selectedId);
      props.onOpenChange(false);
      setSelectedId(null);
    }
  };

  return (
    <ActionDialog
      title={props.title ?? t('workspace.picker.title')}
      open={props.open}
      onOpenChange={(open) => {
        if (!open) setSelectedId(null);
        props.onOpenChange(open);
      }}
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
            onClick: () => {
              setSelectedId(null);
            },
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            disabled: !selectedId,
            onClick: (e) => {
              e.stopPropagation();
              handleConfirm();
            },
          },
        },
      ]}
    >
      <WorkspaceList>
        {filteredWorkspaces.map((ws) => (
          <WorkspaceItem
            key={ws.id}
            $selected={ws.id === selectedId}
            onClick={() => setSelectedId(ws.id)}
          >
            <WorkspaceIconBubble
              icon={ws.meta.icon}
              color={ws.meta.color}
              size={28}
            />
            <WorkspaceName>
              {ws.meta.name || t('workspace.untitled')}
            </WorkspaceName>
          </WorkspaceItem>
        ))}
        {filteredWorkspaces.length === 0 && (
          <WorkspaceName>
            {t(
              props.mustBeEditable
                ? 'workspace.picker.emptyEditable'
                : 'workspace.picker.empty',
            )}
          </WorkspaceName>
        )}
      </WorkspaceList>
    </ActionDialog>
  );
};
