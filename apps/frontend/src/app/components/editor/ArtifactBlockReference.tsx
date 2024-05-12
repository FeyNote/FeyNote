import {
  ArtifactBlockReferenceFC,
} from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import styled from 'styled-components';
import { routes } from '../../routes';

const StyledSpan = styled.span`
  background: rgba(0, 0, 0, 0.2);
`;

interface Props extends React.ComponentProps<ArtifactBlockReferenceFC> {
  referenceDisplayTextByCompositeId: Map<string, string>;
}

export const ArtifactBlockReference: React.FC<Props> = (props) => {
  const displayText = props.referenceDisplayTextByCompositeId.get(props.inlineContent.props.artifactId + props.inlineContent.props.artifactBlockId) || props.inlineContent.props.referenceText;

  return (
    <StyledSpan>
      <IonRouterLink
        routerLink={`${routes.artifact.build({
          id: props.inlineContent.props.artifactId,
        })}?blockId=${props.inlineContent.props.artifactBlockId}`}
      >
        @{displayText}
      </IonRouterLink>
    </StyledSpan>
  );
};
