import { useTranslation } from 'react-i18next';
import { useArtifactDeleteOrRemoveSelf } from './useArtifactDeleteOrRemoveSelf';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { useContext, type ComponentProps } from 'react';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useIonModal } from '@ionic/react';
import { NewArtifactModal } from './NewArtifactModal';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';

interface Props {
  artifactId: string;
  expandAll: () => void;
  collapseAll: () => void;
}

export const ArtifactTreeItemContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = useContext(GlobalPaneContext);
  const [presentNewArtifactModal, dismissNewArtifactModal] = useIonModal(
    NewArtifactModal,
    {
      dismiss: () => dismissNewArtifactModal(),
      tree: {
        parentArtifactId: props.artifactId,
        order: 'X',
      },
    } satisfies ComponentProps<typeof NewArtifactModal>,
  );
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const { deleteArtifactOrRemoveSelf } = useArtifactDeleteOrRemoveSelf();

  const onDeleteArtifactClicked = () => {
    deleteArtifactOrRemoveSelf(props.artifactId).catch((e) => {
      handleTRPCErrors(e);
    });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.HSplit,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.VSplit,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              undefined,
              PaneableComponent.Artifact,
              {
                id: props.artifactId,
              },
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.newTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={props.expandAll}>
          {t('contextMenu.expandAll')}
        </ContextMenuItem>
        <ContextMenuItem onClick={props.collapseAll}>
          {t('contextMenu.collapseAll')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={() => presentNewArtifactModal()}>
          {t('artifactTree.newArtifactWithin')}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDeleteArtifactClicked}>
          {t('generic.delete')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
