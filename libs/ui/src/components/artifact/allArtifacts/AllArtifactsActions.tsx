import { Button, DropdownMenu } from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiArtifactMoveInTreeDialog } from './MultiArtifactMoveInTreeDialog';
import { MultiArtifactDeleteDialog } from './MultiArtifactDeleteDialog';
import { MultiArtifactSharingDialog } from './MultiArtifactSharingDialog';
import { useWorkspaceSnapshot } from '../../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useSessionContext } from '../../../context/session/SessionContext';
import {
  getAccessLevelCanEdit,
  getWorkspaceAccessLevel,
} from '@feynote/shared-utils';
import styled from 'styled-components';

const Container = styled.div`
  margin-left: auto;
`;

interface Props {
  selectedArtifactIds: ReadonlySet<string>;
  workspaceId: string | null;
}

export const AllArtifactsActions: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const sessionContext = useSessionContext(true);
  const { workspaceSnapshot } = useWorkspaceSnapshot(props.workspaceId || '');
  const workspaceIsEditable = useMemo(() => {
    if (!props.workspaceId) return true;
    if (!workspaceSnapshot) return false;
    return getAccessLevelCanEdit(
      getWorkspaceAccessLevel(
        workspaceSnapshot,
        sessionContext?.session.userId,
      ),
    );
  }, [props.workspaceId, workspaceSnapshot, sessionContext?.session.userId]);
  const workspaceArtifactIds = useMemo(() => {
    if (!props.workspaceId || !workspaceSnapshot) return null;
    return new Set(workspaceSnapshot.artifactIds);
  }, [props.workspaceId, workspaceSnapshot]);
  const hasSelectedArtifactsOutsideWorkspace = useMemo(() => {
    if (!workspaceArtifactIds) return false;
    for (const id of props.selectedArtifactIds) {
      if (!workspaceArtifactIds.has(id)) return true;
    }
    return false;
  }, [workspaceArtifactIds, props.selectedArtifactIds]);
  const [showMoveInTreeUi, setShowMoveInTreeUi] = useState(false);
  const [showSharingUi, setShowSharingUi] = useState(false);
  const [showDeleteUi, setShowDeleteUi] = useState(false);

  return (
    <Container>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger disabled={!props.selectedArtifactIds.size}>
          <Button variant="soft">
            {t('allArtifacts.actions')}
            <DropdownMenu.TriggerIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onClick={() => setShowMoveInTreeUi(true)}
            disabled={
              !workspaceIsEditable || hasSelectedArtifactsOutsideWorkspace
            }
          >
            {t('allArtifacts.actions.moveInTree')}
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setShowSharingUi(true)}>
            {t('allArtifacts.actions.manageSharing')}
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setShowDeleteUi(true)} color="red">
            {t('allArtifacts.actions.delete')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {showMoveInTreeUi && (
        <MultiArtifactMoveInTreeDialog
          artifactIds={props.selectedArtifactIds}
          workspaceId={props.workspaceId}
          close={() => setShowMoveInTreeUi(false)}
        />
      )}
      {showDeleteUi && (
        <MultiArtifactDeleteDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowDeleteUi(false)}
        />
      )}
      {showSharingUi && (
        <MultiArtifactSharingDialog
          artifactIds={props.selectedArtifactIds}
          close={() => setShowSharingUi(false)}
        />
      )}
    </Container>
  );
};
