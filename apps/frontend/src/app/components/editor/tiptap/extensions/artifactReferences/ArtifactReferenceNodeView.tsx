import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { getKnownArtifactReferenceKey } from './getKnownArtifactReferenceKey';
import { routes } from '../../../../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { IonRouterLink, useIonRouter } from '@ionic/react';
import type { ReferencePluginOptions } from './ArtifactReferencesExtension';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import styled from 'styled-components';

const StyledNodeViewWrapper = styled(NodeViewWrapper)`
  display: inline;
`;

export const ArtifactReferenceNodeView = (props: NodeViewProps) => {
  const router = useIonRouter();

  const { artifactId, artifactBlockId, artifactDate } = props.node.attrs;

  const key = getKnownArtifactReferenceKey(
    artifactId,
    artifactBlockId || undefined,
    artifactDate || undefined,
  );
  const ref = useRef<HTMLSpanElement>(null);

  const options = props.extension.options as ReferencePluginOptions;
  const knownReference = options.knownReferences.get(key);

  let link = routes.artifact.build({ id: props.node.attrs.artifactId });
  if (artifactBlockId) {
    link += `?blockId=${artifactBlockId}`;
  }
  if (artifactDate) {
    link += `?date=${artifactDate}`;
  }

  const {
    artifact,
    artifactYBin,
    showPreview,
    onMouseOver,
    onMouseOut,
    close,
  } = useArtifactPreviewTimer(
    props.node.attrs.artifactId,
    knownReference?.isBroken ?? false,
  );

  let referenceText =
    knownReference?.referenceText || props.node.attrs.referenceText;
  if (props.node.attrs.artifactDate) {
    referenceText += ` ${props.node.attrs.artifactDate}`;
  }

  return (
    <StyledNodeViewWrapper>
      <ArtifactReferenceSpan
        ref={ref}
        $isBroken={false}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <IonRouterLink
          routerLink={knownReference?.isBroken ? undefined : link}
          onClick={() => close()}
        >
          {referenceText}
        </IonRouterLink>
        {showPreview && artifact && artifactYBin && ref.current && (
          <ArtifactReferencePreview
            onClick={() => (router.push(link, 'forward', 'push'), close())}
            artifact={artifact}
            artifactYBin={artifactYBin}
            artifactBlockId={props.node.attrs.artifactBlockId || undefined}
            artifactDate={props.node.attrs.artifactDate || undefined}
            previewTarget={ref.current}
          />
        )}
      </ArtifactReferenceSpan>
    </StyledNodeViewWrapper>
  );
};
