import styled from 'styled-components';

export const MenuControlsContainer = styled.div`
  display: flex;
  background: var(--ion-background-color, #ffffff);
  box-shadow: 1px 1px 7px rgba(0, 0, 0, 0.4);
  padding: 2px 5px;
  border-radius: 4px;
`;

export const MenuButton = styled.button<{
  $active?: boolean;
}>`
  background: ${(props) =>
    props.$active
      ? `var(--ion-background-color-step-150, #bbbbbb)`
      : `var(--ion-background-color, #ffffff)`};
  color: var(--ion-text-color, #000000);
  padding: 4px;
  border-radius: 4px;
  font-size: 1.15rem;

  &:hover {
    ${(props) =>
      props.$active
        ? ``
        : `
      background: var(--ion-background-color-step-100, #cccccc);
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
