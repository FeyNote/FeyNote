import { PaneTransition } from '../../../../context/globalPane/GlobalPaneContext';
import { useRef, useState } from 'react';
import { usePaneContext } from '../../../../context/pane/PaneContext';
import { PaneableComponent } from '../../../../context/globalPane/PaneableComponent';
import { CompactIonItem } from '../../../CompactIonItem';
import { NowrapIonLabel } from '../../../NowrapIonLabel';
import { useArtifactPreviewTimer } from '../../../editor/tiptap/extensions/artifactReferences/useArtifactPreviewTimer';
import { ArtifactReferencePreview } from '../../../editor/tiptap/extensions/artifactReferences/ArtifactReferencePreview';
import { useTranslation } from 'react-i18next';
import type { Edge } from '@feynote/shared-utils';
import { IonButton, IonIcon } from '@ionic/react';
import { OutgoingReferenceItem } from './OutgoingReferenceItem';
import { chevronDown, chevronUp } from 'ionicons/icons';
import styled from 'styled-components';
import { ArtifactRightSidemenuReferenceContextMenu } from '../ArtifactRightSidemenuReferenceContextMenu';

const ChildReferencesContainer = styled.div`
  margin-left: 16px;
`;

interface Props {
  edges: Edge[];
}

export const OutgoingReferencesToArtifact: React.FC<Props> = (props) => {
  const { pane, navigate } = usePaneContext();
  const { t } = useTranslation();
  const ref = useRef<HTMLIonItemElement>(null);
  const [expanded, setExpanded] = useState(false);
  const edge0 = props.edges.at(0);
  if (!edge0) {
    throw new Error(
      'OutgoingReferencesToArtifact must only be rendered if there are edges present',
    );
  }

  const { previewInfo, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(edge0.targetArtifactId);

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
        id: edge0.targetArtifactId,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );
  };

  const artifactTitle = props.edges.find(
    (edge) => edge.targetArtifactTitle,
  )?.targetArtifactTitle;
  const artifactDirectEdges = props.edges.filter(
    (edge) => !edge.targetArtifactBlockId,
  );
  const artifactBlockReferences = props.edges.filter(
    (edge) => edge.targetArtifactBlockId,
  );

  return (
    <>
      <ArtifactRightSidemenuReferenceContextMenu
        paneId={pane.id}
        currentArtifactId={edge0.artifactId}
        edge={edge0}
      >
        <CompactIonItem lines="none" button>
          <NowrapIonLabel
            ref={ref}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={linkClicked}
          >
            {artifactTitle}
            <p>
              {t('artifactRightSideMenu.outgoing.title.subtitle', {
                count: props.edges.length,
              })}
            </p>
          </NowrapIonLabel>
          {props.edges.length > 1 && (
            <IonButton
              fill="clear"
              onClick={(event) => (
                event.stopPropagation(),
                setExpanded(!expanded)
              )}
              slot="end"
              size="small"
            >
              <IonIcon
                icon={expanded ? chevronUp : chevronDown}
                slot="icon-only"
              />
            </IonButton>
          )}
          {previewInfo && ref.current && (
            <ArtifactReferencePreview
              onClick={(event) => (
                event.stopPropagation(),
                linkClicked(event),
                close()
              )}
              artifactId={edge0.targetArtifactId}
              previewInfo={previewInfo}
              referenceText={
                props.edges.length === 1
                  ? edge0.referenceText
                  : edge0.targetArtifactTitle || ''
              }
              artifactBlockId={
                props.edges.length === 1
                  ? edge0.targetArtifactBlockId || undefined
                  : undefined
              }
              artifactDate={
                props.edges.length === 1
                  ? edge0.targetArtifactDate || undefined
                  : undefined
              }
              previewTarget={ref.current}
            />
          )}
        </CompactIonItem>
      </ArtifactRightSidemenuReferenceContextMenu>
      {expanded && (
        <ChildReferencesContainer>
          {artifactDirectEdges.map((edge) => (
            <OutgoingReferenceItem key={edge.id} edge={edge} />
          ))}
          {artifactBlockReferences.map((edge) => (
            <OutgoingReferenceItem key={edge.id} edge={edge} />
          ))}
        </ChildReferencesContainer>
      )}
    </>
  );
};
