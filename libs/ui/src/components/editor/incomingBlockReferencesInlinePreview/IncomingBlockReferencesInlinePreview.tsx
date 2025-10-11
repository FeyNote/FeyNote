import { useEffect, useState } from 'react';
import { useHoverTimer } from '../tiptap/extensions/artifactReferences/useHoverTimer';
import type { Edge } from '@feynote/shared-utils';
import { StyledBoundedFloatingWindow } from '../../StyledBoundedFloatingWindow';
import { usePaneContext } from '../../../context/pane/PaneContext';
import { PaneTransition } from '../../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { IncomingBlockReferenceInlinePreviewItem } from './IncomingBlockReferenceInlinePreviewItem';
import { getEdgeStore } from '../../../utils/localDb/edges/edgeStore';

const Container = styled.div`
  background-color: var(--ion-background-color);
  border-radius: 8px;
`;

const Heading = styled.h1`
  font-size: 1.2rem;
  margin: 0;
  margin-top: 4px;
  margin-bottom: 16px;
  padding: 0;
`;

const PREVIEW_WIDTH_PX = 600;
const PREVIEW_MIN_HEIGHT_PX = 100;
const PREVIEW_MAX_HEIGHT_PX = 300;

interface Props {
  artifactId: string;
  onMouseOverRef: React.MutableRefObject<
    ((event: MouseEvent, blockId: string) => void) | undefined
  >;
  onMouseOutRef: React.MutableRefObject<(() => void) | undefined>;
}

export const IncomingBlockReferencesInlinePreview = (props: Props) => {
  const { t } = useTranslation();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const { onMouseOut, onMouseOver, show, close } = useHoverTimer();
  const [edges, setEdges] = useState<Edge[]>([]);
  const { navigate } = usePaneContext();

  useEffect(() => {
    // We listen for edges so that we register that they are 'listened to' and not GC'd
    // since all future usage in this component will be "instant" lookups
    return getEdgeStore().listenForArtifactId(props.artifactId, () => {
      // noop
    });
  }, [props.artifactId]);

  props.onMouseOverRef.current = (event, blockId) => {
    const edges = getEdgeStore().getIncomingEdgesForBlock({
      artifactId: props.artifactId,
      blockId,
    });
    setEdges(edges);

    setTarget(event.currentTarget as HTMLElement);
    onMouseOver();
  };
  props.onMouseOutRef.current = () => {
    onMouseOut();
  };

  const openReference = (
    event: React.MouseEvent<HTMLElement>,
    artifactId: string,
    blockId: string,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    let paneTransition = PaneTransition.Push;
    if (event.metaKey || event.ctrlKey) {
      paneTransition = PaneTransition.NewTab;
    }
    navigate(
      PaneableComponent.Artifact,
      {
        id: artifactId,
        focusBlockId: blockId,
      },
      paneTransition,
      !(event.metaKey || event.ctrlKey),
    );

    close();
  };

  if (!show || !target) {
    return null;
  }

  return (
    <StyledBoundedFloatingWindow
      floatTarget={target}
      width={PREVIEW_WIDTH_PX}
      minHeight={PREVIEW_MIN_HEIGHT_PX}
      maxHeight={PREVIEW_MAX_HEIGHT_PX}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Container>
        <Heading>{t('incomingReferencesInlinePreview.header')}</Heading>

        {edges.map((edge) => (
          <IncomingBlockReferenceInlinePreviewItem
            key={edge.id}
            edge={edge}
            open={openReference}
          />
        ))}
      </Container>
    </StyledBoundedFloatingWindow>
  );
};
