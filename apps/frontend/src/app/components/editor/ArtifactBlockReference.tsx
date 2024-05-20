import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { ArtifactBlockReferenceFC } from '@feynote/blocknote';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import { useRef } from 'react';

export const ArtifactBlockReference: ArtifactBlockReferenceFC = (props) => {
  const { referenceText, isBroken, artifactId, artifactBlockId } =
    props.inlineContent.props;
  const ref = useRef<HTMLSpanElement>(null);

  const routerLink = `${routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  })}?blockId=${props.inlineContent.props.artifactBlockId}`;

  const { artifact, showPreview, onMouseOver, onMouseOut } =
    useArtifactPreviewTimer(artifactId, isBroken);

  return (
    <ArtifactReferenceSpan
      ref={ref}
      $isBroken={isBroken}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <IonRouterLink routerLink={isBroken ? undefined : routerLink}>
        @{referenceText}
      </IonRouterLink>
      {showPreview && artifact && ref.current && (
        <ArtifactReferencePreview
          artifact={artifact}
          artifactBlockId={artifactBlockId}
          previewTarget={ref.current}
        />
      )}
    </ArtifactReferenceSpan>
  );
};
