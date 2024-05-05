import { ArtifactBlockReferenceFC } from '@feynote/blocknote';

export const ArtifactBlockReference: ArtifactBlockReferenceFC = (props) => {
  return (
    <span style={{ backgroundColor: '#8400ff33' }}>
      {props.inlineContent.props.referenceText}
    </span>
  );
};
