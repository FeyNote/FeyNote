import styled from 'styled-components';

export const MenuControlsContainer = styled.div`
  display: flex;
  position: relative;
  background: var(--floating-background);
  box-shadow: var(--floating-box-shadow);
  padding: 2px 3px;
  border-radius: 4px;
  z-index: 1;
`;

export const MenuButton = styled.button<{
  $active?: boolean;
}>`
  background: ${(props) =>
    props.$active
      ? `var(--floating-background-active)`
      : `var(--floating-background)`};
  color: var(--text-color);
  padding: 4px;
  border-radius: 4px;
  font-size: 1.15rem;
  text-align: left;
  display: flex;
  align-items: center;

  &:hover {
    background: var(--floating-background-hover);
  }

  &:disabled {
    color: #999999;
  }

  svg {
    vertical-align: middle;
  }
`;

export const MenuDivider = styled.div`
  border-right: 1px solid var(--floating-background-hint);
  margin-left: 4px;
  margin-right: 4px;
`;

export const MenuButtonText = styled.span`
  font-size: 1rem;
  margin-left: 8px;
  margin-right: 8px;
  vertical-align: middle;
`;
