import { PaneTransition } from '../../../../context/globalPane/GlobalPaneContext';
import { useContext, useRef } from 'react';
import { PaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { CompactIonItem } from '../../../CompactIonItem';
import { NowrapIonLabel } from '../../../NowrapIonLabel';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { useContextMenu } from '../../../../utils/contextMenu/useContextMenu';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';

interface Props {
  edge: Edge;
}

export const OutgoingReferenceItem: React.FC<Props> = (props) => {
  const { pane, navigate } = useContext(PaneContext);
  const { t } = useTranslation();
  const ref = useRef<HTMLIonItemElement>(null);

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(props.edge.targetArtifactId, props.edge.isBroken);

  const linkClicked = (
    event: React.MouseEvent<
      | HTMLAnchorElement
      | HTMLDivElement
      | HTMLIonItemElement
      | HTMLIonLabelElement
    >,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    let paneTransition = PaneTransition.Push;
    if (event.metaKey || event.ctrlKey) {
      paneTransition = PaneTransition.NewTab;
    }
    navigate(
      PaneableComponent.Artifact,
      {
        id: props.edge.targetArtifactId,
        focusBlockId: props.edge.targetArtifactBlockId || undefined,
        focusDate: props.edge.targetArtifactDate || undefined,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const { onContextMenu } = useContextMenu(
    ArtifactRightSidemenuReferenceContextMenu,
    {
      paneId: pane.id,
      currentArtifactId: props.edge.artifactId,
      edge: props.edge,
      navigate,
    },
  );

  const blockReferenceContent = (
    <NowrapIonLabel>
      {t('artifactRightSideMenu.outgoing.block', {
        text: props.edge.referenceText,
      })}
      {!props.edge.isBroken && (
        <p>
          {t('artifactRightSideMenu.outgoing.block.subtitle', {
            title: props.edge.targetArtifactTitle,
          })}
        </p>
      )}
      {props.edge.isBroken && (
        <p>{t('artifactRightSideMenu.brokenReference')}</p>
      )}
    </NowrapIonLabel>
  );

  const artifactReferenceContent = (
    <NowrapIonLabel>
      {t('artifactRightSideMenu.outgoing.artifact')}
      {!props.edge.isBroken && (
        <p>
          {t('artifactRightSideMenu.outgoing.artifact.subtitle', {
            title: props.edge.targetArtifactTitle,
          })}
        </p>
      )}
      {props.edge.isBroken && (
        <p>{t('artifactRightSideMenu.brokenReference')}</p>
      )}
    </NowrapIonLabel>
  );

  const content = props.edge.targetArtifactBlockId
    ? blockReferenceContent
    : artifactReferenceContent;

  return (
    <CompactIonItem
      lines="none"
      ref={ref}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={linkClicked}
      onContextMenu={(event) => (onContextMenu(event), close())}
      button
    >
      {content}
      {previewInfo && ref.current && (
        <ArtifactReferencePreview
          onClick={(event) => (
            event.stopPropagation(), linkClicked(event), close()
          )}
          artifactId={props.edge.targetArtifactId}
          previewInfo={previewInfo}
          referenceText={props.edge.referenceText}
          artifactBlockId={props.edge.targetArtifactBlockId || undefined}
          artifactDate={props.edge.targetArtifactDate || undefined}
          previewTarget={ref.current}
        />
      )}
    </CompactIonItem>
  );
};
