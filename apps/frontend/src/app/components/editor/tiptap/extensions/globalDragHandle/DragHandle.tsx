import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdOutlineDragIndicator } from 'react-icons/md';
import styled from 'styled-components';

const Handle = styled.div`
  display: flex;
  vertical-align: center;
  justify-content: center;

  background: var(--ion-card-background);
  color: var(--ion-text-color);
  border-radius: 4px;
`;

const Menu = styled.div`
  width: 100px;
  position: relative;

  box-shadow: 1px 1px 7px rgba(0,0,0,0.35);
  background: var(--ion-card-background);
  color: var(--ion-text-color);
  border-radius: 4px;
`;

const MenuItem = styled.button`
  width: 100%;

  min-height: 20px;

  &:hover {
    background: var(--ion-background-color);
  }
`;

const MOUSE_EXIT_FORGIVENESS = 200;

export const DragHandle = () => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout>();

  const domHandleContainer = document.querySelector('#tiptap-global-drag-handle-container');

  const domHandle = document.querySelector('#tiptap-global-drag-handle');

  const domMenu = document.querySelector('#tiptap-global-drag-handle-menu');

  useEffect(() => {
    if (showMenu) {
      domHandleContainer?.setAttribute("data-frozen", "true");
    }

    return () => domHandleContainer?.removeAttribute("data-frozen");
  }, [showMenu]);

  const onMouseLeave = () => {
    clearTimeout(closeTimerRef.current);

    closeTimerRef.current = setTimeout(() => {
      setShowMenu(false);
    }, MOUSE_EXIT_FORGIVENESS);
  }

  const onMouseEnter = () => {
    clearTimeout(closeTimerRef.current);
  }

  if (!domHandleContainer || !domHandle || !domMenu) return <></>;

  const handleJsx = (
    <Handle
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onClick={() => setShowMenu(!showMenu)}
    >
      <MdOutlineDragIndicator size={18} />
    </Handle>
  );

  const menuJsx = (
    <Menu
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <MenuItem>
        {t('editor.dragmenu.delete')}
      </MenuItem>
    </Menu>
  );

  return (
    <>
      {createPortal(
        handleJsx,
        domHandle,
      )}
      {showMenu && (
        createPortal(
          menuJsx,
          domMenu,
        )
      )}
    </>
  );
};
