import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { ArtifactTypeSelector } from '../editor/ArtifactTypeSelector';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { ActionDialog } from '../sharedComponents/ActionDialog';

interface Props {
  tree: Parameters<typeof createArtifact>[0]['tree'];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewArtifactDialog: React.FC<Props> = (props) => {
  const { navigate } = useGlobalPaneContext();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const newArtifact = async (type: ArtifactType) => {
    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type,
      },
      tree: props.tree,
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    props.onOpenChange(false);

    if (!result) return;

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
      <ArtifactTypeSelector
        newArtifact={newArtifact}
        newAIThread={() => undefined}
        options={{
          showNewAIThread: false,
        }}
      />
    </ActionDialog>
  );
};
