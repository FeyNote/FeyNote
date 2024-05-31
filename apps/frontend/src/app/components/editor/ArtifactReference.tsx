import { ArtifactReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import { useRef } from 'react';

export const ArtifactReference: ArtifactReferenceFC = (props) => {
  const displayText = props.inlineContent.props.referenceText;
  const isBroken = props.inlineContent.props.isBroken;
  const artifactId = props.inlineContent.props.artifactId;
  const ref = useRef<HTMLSpanElement>(null);

  const routerLink = routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  });

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
        @{displayText}
      </IonRouterLink>
      {showPreview && artifact && ref.current && (
        <ArtifactReferencePreview
          artifact={artifact}
          previewTarget={ref.current}
        />
      )}
    </ArtifactReferenceSpan>
  );
};
