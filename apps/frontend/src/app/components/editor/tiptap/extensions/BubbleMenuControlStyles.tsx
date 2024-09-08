import styled from 'styled-components';

export const MenuControlsContainer = styled.div`
  display: flex;
  position: relative;
  background: var(--ion-background-color-step-250, #ffffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
  padding: 2px 3px;
  border-radius: 4px;
`;

export const MenuButton = styled.button<{
  $active?: boolean;
}>`
  background: ${(props) =>
    props.$active
      ? `var(--ion-background-color, #cccccc)`
      : `var(--ion-background-color-step-250, #ffffff)`};
  color: var(--ion-text-color, #000000);
  padding: 4px;
  border-radius: 4px;
  font-size: 1.15rem;
  text-align: left;
  display: flex;
  align-items: center;

  &:hover {
    ${(props) =>
      props.$active
        ? ``
        : `
      background: var(--ion-background-color, #cccccc);
    `}
  }

  &:disabled {
    color: #999999;
  }

  svg {
    vertical-align: middle;
  }
`;

export const MenuDivider = styled.div`
  border-right: 1px solid var(--ion-text-color, #cccccc);
  margin-left: 4px;
  margin-right: 4px;
`;

export const MenuButtonText = styled.span`
  font-size: 1rem;
  margin-left: 8px;
  margin-right: 8px;
  vertical-align: middle;
`;
