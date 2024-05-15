import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { ArtifactBlockReferenceFC } from '@feynote/blocknote';

export const ArtifactBlockReference: ArtifactBlockReferenceFC = (props) => {
  const displayText = props.inlineContent.props.referenceText;
  const isBroken = props.inlineContent.props.isBroken;

  const routerLink = `${routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  })}?blockId=${props.inlineContent.props.artifactBlockId}`;

  return (
    <ArtifactReferenceSpan isBroken={isBroken}>
      <IonRouterLink routerLink={isBroken ? undefined : routerLink}>
        @{displayText}
      </IonRouterLink>
    </ArtifactReferenceSpan>
  );
};
