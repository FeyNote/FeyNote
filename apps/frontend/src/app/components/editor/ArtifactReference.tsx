import { ArtifactReferenceFC } from '@feynote/blocknote';

interface Props extends React.ComponentProps<ArtifactReferenceFC> {
  referenceDisplayTextByCompositeId: Map<string, string>;
}

export const ArtifactReference: React.FC<Props> = (props) => {
  const displayText = props.referenceDisplayTextByCompositeId.get(props.inlineContent.props.artifactId) || props.inlineContent.props.referenceText;

  return (
    <span style={{ backgroundColor: '#8400ff33' }}>
      @{displayText}
    </span>
  );
};
