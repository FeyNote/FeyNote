import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { getKnownArtifactReferenceKey } from './getKnownArtifactReferenceKey';
import { routes } from '../../../../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { IonRouterLink } from '@ionic/react';
import type { ReferencePluginOptions } from './ArtifactReferencesExtension';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { useRef } from 'react';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';

export const ArtifactReferenceNodeView = (props: NodeViewProps) => {
  const key = getKnownArtifactReferenceKey(
    props.node.attrs.artifactId,
    props.node.attrs.artifactBlockId || undefined,
  );
  const ref = useRef<HTMLSpanElement>(null);

  const options = props.extension.options as ReferencePluginOptions;
  const knownReference = options.knownReferences.get(key);

  const link = routes.artifact.build({ id: props.node.attrs.artifactId });

  const { artifact, showPreview, onMouseOver, onMouseOut } =
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
        <IonRouterLink routerLink={knownReference?.isBroken ? undefined : link}>
          {knownReference?.referenceText || props.node.attrs.referenceText}
        </IonRouterLink>
        {showPreview && artifact && ref.current && (
          <ArtifactReferencePreview
            artifact={artifact}
            artifactBlockId={props.node.attrs.artifactBlockId || undefined}
            previewTarget={ref.current}
          />
        )}
      </ArtifactReferenceSpan>
    </NodeViewWrapper>
  );
};
