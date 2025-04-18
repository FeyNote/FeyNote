import { useTranslation } from 'react-i18next';
import { PaneContextData } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  ContextMenuContainer,
  ContextMenuGroup,
  ContextMenuGroupDivider,
  ContextMenuItem,
} from '../contextMenu/sharedComponents';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { getMetaFromYArtifact } from '@feynote/shared-utils';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { Doc as YDoc, applyUpdate, encodeStateAsUpdate } from 'yjs';
import { randomizeContentUUIDsInYDoc } from '../../utils/edgesReferences/randomizeContentUUIDsInYDoc';
import { createArtifact } from '../../utils/createArtifact';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';

interface Props {
  artifactId: string;
  triggerDelete: () => void;
  triggerUndelete: () => void;
  connection: CollaborationManagerConnection;
  pane: PaneContextData['pane'];
  navigate: PaneContextData['navigate'];
  isEditable: boolean;
}

export const ArtifactContextMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { pane, navigate } = props;

  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { deletedAt } = useObserveYArtifactMeta(props.connection.yjsDoc);

  const onPrintArtifactClicked = () => {
    window.open(
      `${window.location.hostname}?printArtifactId=${props.artifactId}&autoPrint=true`,
    );
  };

  const onDuplicateArtifactClicked = async () => {
    const { title, theme, type } = getMetaFromYArtifact(
      props.connection.yjsDoc,
    );

    const newTitle = t('artifact.duplicateTitle', { title });
    const oldYBin = encodeStateAsUpdate(props.connection.yjsDoc);
    const newYDoc = new YDoc();
    applyUpdate(newYDoc, oldYBin);

    randomizeContentUUIDsInYDoc(newYDoc);

    const newYBin = encodeStateAsUpdate(newYDoc);

    const artifact = await createArtifact({
      title: newTitle,
      type,
      theme,
      yBin: newYBin,
    }).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!artifact) return;

    navigate(
      PaneableComponent.Artifact,
      { id: artifact.id },
      PaneTransition.NewTab,
    );
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
        {props.isEditable && !deletedAt && (
          <ContextMenuItem onClick={props.triggerDelete}>
            {t('generic.delete')}
          </ContextMenuItem>
        )}
        {props.isEditable && deletedAt && (
          <ContextMenuItem onClick={props.triggerUndelete}>
            {t('artifact.deleted.undelete')}
          </ContextMenuItem>
        )}
      </ContextMenuGroup>
    </ContextMenuContainer>
  );
};
