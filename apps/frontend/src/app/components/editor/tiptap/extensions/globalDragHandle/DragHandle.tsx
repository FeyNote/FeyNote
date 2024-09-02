import { createPortal } from 'react-dom';
import { MdOutlineDragIndicator } from 'react-icons/md';
import styled from 'styled-components';

const Handle = styled.div`
  display: flex;
  vertical-align: center;
  justify-content: center;

  background: var(--ion-card-background, #ffffff);
  color: var(--ion-text-color, #000000);
  border-radius: 4px;
`;

export const DragHandle = () => {
  const domHandle = document.querySelector('#tiptap-global-drag-handle');

  if (!domHandle) return false;

  return createPortal(
    <Handle>
      <MdOutlineDragIndicator size={18} />
    </Handle>,
    domHandle,
  );
};
