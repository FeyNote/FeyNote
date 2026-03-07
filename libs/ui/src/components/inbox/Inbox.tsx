import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Text } from '@radix-ui/themes';
import styled from 'styled-components';
import { PaneNav } from '../pane/PaneNav';
import {
  PaneContent,
  PaneContentContainer,
} from '../pane/PaneContentContainer';
import { useSessionContext } from '../../context/session/SessionContext';
import { NullState } from '../info/NullState';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { mailOpenOutline } from 'ionicons/icons';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { WorkspacePickerDialog } from '../workspace/WorkspacePickerDialog';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useAlertContext } from '../../context/alert/AlertContext';
import { useKnownUsers } from '../../utils/localDb/knownUsers/useKnownUsers';
import { useAcceptedIncomingSharedArtifactIds } from '../../utils/artifactTree/useAcceptedIncomingSharedArtifactIds';
import { useInboxArtifactSnapshots } from '../../utils/artifactTree/useInboxArtifactSnapshots';

const StyledNullState = styled(NullState)`
  padding-top: 48px;
`;

const InboxItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--general-background-hover);
`;

const InboxItemTitle = styled.span`
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const Inbox: React.FC = () => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { editableWorkspaceSnapshots } = useWorkspaceSnapshots();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();
  const [addToWorkspaceArtifactId, setAddToWorkspaceArtifactId] = useState<
    string | null
  >(null);

  const { getKnownUserById } = useKnownUsers();
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { acceptedIncomingSharedArtifactIdsYKV } =
    useAcceptedIncomingSharedArtifactIds(connection.yjsDoc);
  const { inboxArtifactSnapshots } = useInboxArtifactSnapshots();

  const handleAccept = (artifactId: string) => {
    acceptedIncomingSharedArtifactIdsYKV.set(artifactId, { accepted: true });
  };

  const handleDecline = (artifactId: string) => {
    trpc.artifact.removeSelfAsCollaborator
      .mutate({ artifactId })
      .catch((e) => handleTRPCErrors(e));
  };

  const handleAcceptAndAddToWorkspace = (artifactId: string) => {
    acceptedIncomingSharedArtifactIdsYKV.set(artifactId, { accepted: true });
    setAddToWorkspaceArtifactId(artifactId);
  };

  const handleWorkspaceSelected = async (workspaceId: string) => {
    if (!addToWorkspaceArtifactId) return;
    await addArtifactToWorkspaceWithSharingPrompt({
      workspaceId,
      artifactId: addToWorkspaceArtifactId,
      getPreference,
      setPreference,
      showAlert,
    });
    setAddToWorkspaceArtifactId(null);
  };

  return (
    <PaneContentContainer>
      <PaneNav title={t('inbox.title')} />
      <PaneContent>
        {inboxArtifactSnapshots.length === 0 ? (
          <StyledNullState
            icon={mailOpenOutline}
            title={t('inbox.empty')}
            message={t('inbox.empty.message')}
          />
        ) : (
          inboxArtifactSnapshots.map((artifactSnapshot) => (
            <InboxItemRow key={artifactSnapshot.id}>
              <Flex direction="column" gap="1">
                <InboxItemTitle
                  onClick={(event) =>
                    navigateWithKeyboardHandler(
                      event,
                      PaneableComponent.Artifact,
                      { id: artifactSnapshot.id },
                    )
                  }
                >
                  {artifactSnapshot.meta.title || t('generic.untitled')}
                </InboxItemTitle>
                <Text size="1" color="gray">
                  {t('inbox.owner', {
                    user: getKnownUserById(artifactSnapshot.meta.userId)?.name,
                  })}
                </Text>
              </Flex>
              <Flex gap="2">
                <Button
                  size="1"
                  variant="soft"
                  onClick={() => handleAccept(artifactSnapshot.id)}
                >
                  {t('inbox.accept')}
                </Button>
                {editableWorkspaceSnapshots.length > 0 && (
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() =>
                      handleAcceptAndAddToWorkspace(artifactSnapshot.id)
                    }
                  >
                    {t('inbox.acceptAndAddToWorkspace')}
                  </Button>
                )}
                <Button
                  size="1"
                  variant="soft"
                  color="red"
                  onClick={() => handleDecline(artifactSnapshot.id)}
                >
                  {t('inbox.decline')}
                </Button>
              </Flex>
            </InboxItemRow>
          ))
        )}
      </PaneContent>
      <WorkspacePickerDialog
        open={addToWorkspaceArtifactId !== null}
        onOpenChange={(open) => {
          if (!open) setAddToWorkspaceArtifactId(null);
        }}
        onSelect={handleWorkspaceSelected}
        mustBeEditable={true}
        title={t('workspace.addDocument')}
      />
    </PaneContentContainer>
  );
};
