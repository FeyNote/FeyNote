import { ArtifactReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';

export const ArtifactReference: ArtifactReferenceFC = (props) => {
  const displayText = props.inlineContent.props.referenceText;
  const isBroken = props.inlineContent.props.isBroken;

  const routerLink = routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  });

  return (
    <ArtifactReferenceSpan isBroken={isBroken}>
      <IonRouterLink routerLink={isBroken ? undefined : routerLink}>
        @{displayText}
      </IonRouterLink>
    </ArtifactReferenceSpan>
  );
};
