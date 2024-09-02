import styled from 'styled-components';

export const ContextMenuContainer = styled.div`
  position: relative;
  padding: 8px;
`;

export const ContextMenuGroup = styled.div``;

export const ContextMenuItem = styled.button`
  height: 38px;
  text-align: left;
  background: none;
  color: var(--ion-text-color, #000000);
  width: 100%;
  padding: 0px 12px;
  border-radius: 4px;
  margin-top: 2px;
  margin-bottom: 2px;

  &:hover {
    background: var(--ion-card-background);
  }
`;

export const ContextMenuGroupDivider = styled.div`
  border-bottom: 1px solid var(--ion-card-background);
`;
