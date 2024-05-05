import { ArtifactBlockReferenceFC } from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import styled from 'styled-components';
import { routes } from '../../routes';

const StyledSpan = styled.span`
  background: rgba(0, 0, 0, 0.2);
`;

export const ArtifactBlockReference: ArtifactBlockReferenceFC = (props) => {
  return (
    <StyledSpan>
      <IonRouterLink
        routerLink={`${routes.artifact.build({
          id: props.inlineContent.props.artifactId,
        })}?blockId=${props.inlineContent.props.artifactBlockId}`}
      >
        @{props.inlineContent.props.referenceText}
      </IonRouterLink>
    </StyledSpan>
  );
};
