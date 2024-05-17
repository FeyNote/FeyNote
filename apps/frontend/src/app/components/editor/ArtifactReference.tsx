import { ArtifactReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import { createPortal } from 'react-dom';
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
      {showPreview &&
        artifact &&
        ref.current &&
        createPortal(
          // We portal because blocknote styling does not play well with blocknote instances inside of each other
          <ArtifactReferencePreview
            artifact={artifact}
            top={
              ref.current.getBoundingClientRect().top +
              ref.current.getBoundingClientRect().height
            }
            left={ref.current.getBoundingClientRect().left}
          />,
          document.getElementById('referencePreviewContainer')!,
        )}
    </ArtifactReferenceSpan>
  );
};
