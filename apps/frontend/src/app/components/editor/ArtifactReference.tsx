import { ArtifactReferenceFC } from '@feynote/blocknote';

export const ArtifactReference: ArtifactReferenceFC = (props) => {
  return (
    <span style={{ backgroundColor: '#8400ff33' }}>
      {props.inlineContent.props.referenceText}
    </span>
  );
};
