import { ArtifactEditorBlock, ArtifactReferenceFC } from '@feynote/blocknote';

interface Props extends React.ComponentProps<ArtifactReferenceFC> {
  blocksById: Record<string, ArtifactEditorBlock>;
}

export const ArtifactReference: React.FC<Props> = (props) => {
  return (
    <span style={{ backgroundColor: '#8400ff33' }}>
      {props.inlineContent.props.referenceText}
    </span>
  );
};
