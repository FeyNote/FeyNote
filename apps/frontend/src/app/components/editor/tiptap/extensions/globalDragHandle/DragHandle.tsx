import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineDragIndicator } from 'react-icons/md';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  vertical-align: center;
  justify-content: center;

  background: var(--ion-card-background);
  color: var(--ion-text-color);
  border-radius: 4px;
`;

const Menu = styled.div`
  display: flex;
  vertical-align: center;
  justify-content: center;

  background: var(--ion-card-background);
  color: var(--ion-text-color);
  border-radius: 4px;
`;

export const DragHandle = () => {
  const [showMenu, setShowMenu] = useState(false);

  const container = document.querySelector('#tiptap-global-drag-handle');
  if (!container) return <></>;
  return createPortal(
    <>
      <Container onClick={() => setShowMenu(!showMenu)}>
        <MdOutlineDragIndicator size={18} />
      </Container>
      {showMenu && <Menu>HI THERE</Menu>}
    </>,
    container,
  );
};
