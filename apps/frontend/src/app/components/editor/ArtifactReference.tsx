import { ArtifactReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { Reference } from './Reference';
import { RerenderManager } from './rerenderManager';

interface Props extends React.ComponentProps<ArtifactReferenceFC> {
  knownReferences: Map<string, Reference>;
  blocknoteRerenderManager: RerenderManager;
}

export const ArtifactReference: React.FC<Props> = (props) => {
  const existingReference = props.knownReferences.get(props.inlineContent.props.artifactId);
  const displayText = existingReference?.displayText || props.inlineContent.props.referenceText;

  const routerLink = routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  });

  return (
    <ArtifactReferenceSpan isBroken={!!existingReference?.isBroken}>
      <IonRouterLink
        routerLink={existingReference?.isBroken ? undefined : routerLink}
      >
        @{displayText}
      </IonRouterLink>
    </ArtifactReferenceSpan>
  );
};
