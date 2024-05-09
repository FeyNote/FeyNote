import {
  ArtifactBlockReferenceFC,
  ArtifactEditorBlock,
} from '@feynote/blocknote';
import { IonRouterLink } from '@ionic/react';
import styled from 'styled-components';
import { routes } from '../../routes';

const StyledSpan = styled.span`
  background: rgba(0, 0, 0, 0.2);
`;

interface Props extends React.ComponentProps<ArtifactBlockReferenceFC> {
  blocksById: Record<string, ArtifactEditorBlock>;
}

const getTextForBlock = (block: ArtifactEditorBlock): string => {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
    case 'bulletListItem':
    case 'numberedListItem': {
      return (
        block.content
          .map((content) => {
            if (content.type === 'text') {
              return content.text;
            }
            if (content.type === 'link') {
              return content.content
                .map((linkContent) => linkContent.text)
                .join(' ');
            }
            if (content.type === 'artifactReference') {
              return '...';
            }
            if (content.type === 'artifactBlockReference') {
              return '...';
            }
          })
          .join(' ') || 'NO TEXT FOR BLOCK!'
      );
    }
    case 'image': {
      return block.props.caption || 'Image';
    }
    case 'table': {
      return 'Table';
    }
  }
};

export const ArtifactBlockReference: React.FC<Props> = (props) => {
  const referencedBlock =
    props.blocksById[props.inlineContent.props.artifactBlockId];
  const text = referencedBlock
    ? getTextForBlock(referencedBlock)
    : props.inlineContent.props.referenceText;

  return (
    <StyledSpan>
      <IonRouterLink
        routerLink={`${routes.artifact.build({
          id: props.inlineContent.props.artifactId,
        })}?blockId=${props.inlineContent.props.artifactBlockId}`}
      >
        @{text}
      </IonRouterLink>
    </StyledSpan>
  );
};
