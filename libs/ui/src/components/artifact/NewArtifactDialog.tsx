import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { CreateNewTypeSelector } from '../editor/CreateNewTypeSelector';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useAlertContext } from '../../context/alert/AlertContext';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';

interface Props {
  tree: Parameters<typeof createArtifact>[0]['tree'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewArtifactDialog: React.FC<Props> = (props) => {
  const { navigate } = useGlobalPaneContext();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();

  const newArtifact = async (type: ArtifactType) => {
    const tree = props.tree
      ? { ...props.tree, workspaceId: currentWorkspaceId || undefined }
      : undefined;

    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type,
      },
      tree,
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    props.onOpenChange(false);

    if (!result) return;

    if (currentWorkspaceId) {
      await addArtifactToWorkspaceWithSharingPrompt({
        workspaceId: currentWorkspaceId,
        artifactId: result.id,
        getPreference,
        setPreference,
        showAlert,
      });
    }

    navigate(
      undefined,
      PaneableComponent.Artifact,
      { id: result.id },
      PaneTransition.Replace,
    );
  };

  return (
    <ActionDialog
      title=""
      open={props.open}
      onOpenChange={props.onOpenChange}
      size="xlarge"
    >
      <CreateNewTypeSelector
        newArtifact={newArtifact}
        newAIThread={() => undefined}
        options={{
          showNewAIThread: false,
        }}
      />
    </ActionDialog>
  );
};
