import { createReactInlineContentSpec } from '@blocknote/react';

export const artifactBlockReference = createReactInlineContentSpec(
  {
    type: 'artifactBlockReference',
    propSchema: {
      artifactBlockId: {
        default: 'Unknown',
      },
      artifactBlockReferenceText: {
        default: 'Unknown',
      },
    },
    content: 'none',
  },
  {
    // TODO: Style this
    render: (props) => (
      <span style={{ backgroundColor: '#8400ff33' }}>
        {props.inlineContent.props.artifactBlockReferenceText}
      </span>
    ),
  }
);
