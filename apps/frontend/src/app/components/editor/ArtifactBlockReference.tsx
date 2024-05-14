import { ArtifactBlockReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import { routes } from '../../routes';
import { ArtifactReferenceSpan } from './ArtifactReferenceSpan';
import { Reference } from './Reference';
import { useEffect, useState } from 'react';
import { RerenderManager } from './rerenderManager';

interface Props extends React.ComponentProps<ArtifactBlockReferenceFC> {
  knownReferences: Map<string, Reference>;
  blocknoteRerenderManager: RerenderManager;
}

export const ArtifactBlockReference: React.FC<Props> = (props) => {
  const [_, setRerender] = useState(Math.random());

  useEffect(() => {
    const listener = () => {
      setRerender(Math.random());
    };
    props.blocknoteRerenderManager.addEventListener(listener);
    return () => {
      props.blocknoteRerenderManager.removeEventListener(listener);
    };
  }, []);

  const existingReference = props.knownReferences.get(
    props.inlineContent.props.artifactId +
      props.inlineContent.props.artifactBlockId,
  );
  const displayText =
    existingReference?.displayText || props.inlineContent.props.referenceText;

  console.log('rendered', displayText);

  const routerLink = `${routes.artifact.build({
    id: props.inlineContent.props.artifactId,
  })}?blockId=${props.inlineContent.props.artifactBlockId}`;

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
