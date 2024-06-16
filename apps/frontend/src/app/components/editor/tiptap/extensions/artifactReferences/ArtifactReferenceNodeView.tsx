import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { getKnownArtifactReferenceKey } from './getKnownArtifactReferenceKey';
import { routes } from '../../../../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { IonRouterLink, useIonRouter } from '@ionic/react';
import type { ReferencePluginOptions } from './ArtifactReferencesExtension';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';

export const ArtifactReferenceNodeView = (props: NodeViewProps) => {
  const router = useIonRouter();

  const { artifactId, artifactBlockId } = props.node.attrs;

  const key = getKnownArtifactReferenceKey(
    artifactId,
    artifactBlockId || undefined,
  );
  const ref = useRef<HTMLSpanElement>(null);

  const options = props.extension.options as ReferencePluginOptions;
  const knownReference = options.knownReferences.get(key);

  let link = routes.artifact.build({ id: props.node.attrs.artifactId });
  if (artifactBlockId) {
    link += `?blockId=${artifactBlockId}`;
  }

  const { artifact, showPreview, onMouseOver, onMouseOut, close } =
    useArtifactPreviewTimer(
      props.node.attrs.artifactId,
      knownReference?.isBroken ?? false,
    );

  return (
    <NodeViewWrapper>
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
          {knownReference?.referenceText || props.node.attrs.referenceText}
        </IonRouterLink>
        {showPreview && artifact && ref.current && (
          <ArtifactReferencePreview
            onClick={() => (router.push(link, 'forward', 'push'), close())}
            artifact={artifact}
            artifactBlockId={props.node.attrs.artifactBlockId || undefined}
            previewTarget={ref.current}
          />
        )}
      </ArtifactReferenceSpan>
    </NodeViewWrapper>
  );
};
