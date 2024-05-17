import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { ArtifactBlockReferenceFC } from '@feynote/blocknote';
import { useArtifactPreviewTimer } from './useArtifactPreviewTimer';
import { ArtifactReferencePreview } from './ArtifactReferencePreview';
import { createPortal } from 'react-dom';
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
      {showPreview &&
        artifact &&
        ref.current &&
        createPortal(
          // We portal because blocknote styling does not play well with blocknote instances inside of each other
          <ArtifactReferencePreview
            artifact={artifact}
            artifactBlockId={artifactBlockId}
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
