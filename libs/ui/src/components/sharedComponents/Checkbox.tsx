import { Checkbox as RadixCheckbox } from 'radix-ui';
import type { MouseEventHandler } from 'react';
import { FaCheck, FaMinus } from '../AppIcons';
import styled from 'styled-components';

const StyledCheckboxRoot = styled(RadixCheckbox.Root)<{
  $size: number;
}>`
  transition: background-color 150ms;
  background-color: var(--general-background);
  ${(props) => `
    width: ${props.$size}px;
    min-width: ${props.$size}px;
    height: ${props.$size}px;
  `}
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: 1px solid var(--text-color-dim);

  &:hover {
    background-color: var(--general-background-hover);
  }

  &:focus {
    outline: 1px solid var(--ion-color-primary);
  }
`;

const StyledCheckboxIndicator = styled(RadixCheckbox.Indicator)`
  color: var(--text-color);
  display: flex;
  align-items: center;
`;

interface Props {
  size: 'large' | 'medium' | 'small';
  checked: boolean | 'indeterminate';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const Checkbox: React.FC<Props> = (props) => {
  const size: number = (() => {
    switch (props.size) {
      case 'large':
        return 24;
      case 'medium':
        return 20;
      case 'small':
        return 16;
    }
  })();

  return (
    <StyledCheckboxRoot
      $size={size}
      checked={props.checked}
      onClick={props.onClick}
    >
      <StyledCheckboxIndicator>
        {props.checked === 'indeterminate' && <FaMinus />}
        {props.checked === true && <FaCheck />}
      </StyledCheckboxIndicator>
    </StyledCheckboxRoot>
  );
};
