import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import styled from 'styled-components';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

const HandleWrapper = styled(NodeViewWrapper)`
  display: flex;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  background: white;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0px 10px 20px rgba(0, 0, 0, 0.1);
`;

const Handle = styled.div`
  flex: 0 0 auto;
  position: relative;
  width: 1rem;
  height: 1rem;
  top: 0.3rem;
  margin-right: 0.5rem;
  cursor: grab;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
`;

const Content = styled(NodeViewContent)`
  flex: 1 1 auto;
`;

const Component: React.FC = () => {
  return (
    <HandleWrapper>
      <Handle
        className="drag-handle"
        contentEditable="false"
        draggable="true"
        data-drag-handle
      />
      <Content />
    </HandleWrapper>
  );
};

export const DraggableItem = Node.create({
  name: 'draggableItem',
  group: 'block',
  content: 'block+',
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="draggable-item"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-item' }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
