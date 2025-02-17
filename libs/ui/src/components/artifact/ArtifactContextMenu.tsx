import { useTranslation } from 'react-i18next';
import {
  ArtifactDeleteDeclinedError,
  useArtifactDelete,
} from './useArtifactDelete';
import { PaneContextData } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { trpc } from '../../utils/trpc';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { Doc as YDoc, applyUpdate, encodeStateAsUpdate } from 'yjs';
import { randomizeContentUUIDsInYDoc } from '../../utils/edgesReferences/randomizeContentUUIDsInYDoc';

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
}

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = props;

  const { deleteArtifact } = useArtifactDelete();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const onDeleteArtifactClicked = () => {
    deleteArtifact(props.artifactId)
      .then(() => {
        navigate(PaneableComponent.Dashboard, {}, PaneTransition.Replace);
      })
      .catch((e) => {
        if (e instanceof ArtifactDeleteDeclinedError) return;

        throw e;
      });
  };

  const onPrintArtifactClicked = () => {
    window.open(
      `${window.location.hostname}?printArtifactId=${props.artifactId}&autoPrint=true`,
    );
  };

  const onDuplicateArtifactClicked = () => {
    const { title, theme, type, titleBodyMerge } = getMetaFromYArtifact(
      props.connection.yjsDoc,
    );

    const newTitle = t('artifact.duplicateTitle', { title });
    const oldYBin = encodeStateAsUpdate(props.connection.yjsDoc);
    const newYDoc = new YDoc();
    applyUpdate(newYDoc, oldYBin);

    randomizeContentUUIDsInYDoc(newYDoc);

    const newYBin = encodeStateAsUpdate(newYDoc);

    trpc.artifact.createArtifact
      .mutate({
        title: newTitle,
        theme,
        type: type || 'tiptap',
        titleBodyMerge,
        yBin: newYBin,
      })
      .then(({ id }) => {
        navigate(PaneableComponent.Artifact, { id }, PaneTransition.NewTab);
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
  };

  return (
    <ContextMenuContainer>
      <ContextMenuGroup>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.HSplit,
            )
          }
        >
          {t('contextMenu.splitRight')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.VSplit,
            )
          }
        >
          {t('contextMenu.splitDown')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            navigate(
              pane.currentView.component,
              pane.currentView.props,
              PaneTransition.NewTab,
            )
          }
        >
          {t('contextMenu.duplicateTab')}
        </ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuGroupDivider />
      <ContextMenuGroup>
        <ContextMenuItem onClick={onPrintArtifactClicked}>
          {t('contextMenu.printArtifact')}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicateArtifactClicked}>
          {t('contextMenu.duplicateArtifact')}
        </ContextMenuItem>
        <ContextMenuItem onClick={onDeleteArtifactClicked}>
          {t('generic.delete')}
        </ContextMenuItem>
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
