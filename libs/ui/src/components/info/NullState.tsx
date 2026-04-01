import type { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
`;

const HEADER_FONT_SIZE = {
  xsmall: '0.85rem',
  small: '1.1rem',
  large: '1.5rem',
} as const;

const ICON_FONT_SIZE = {
  xsmall: '1.25rem',
  small: '1.5rem',
  large: '2rem',
} as const;

const Header = styled.h2<{
  $size: 'xsmall' | 'small' | 'large';
}>`
  font-size: ${(props) => HEADER_FONT_SIZE[props.$size]};
  font-weight: ${(props) => (props.$size === 'xsmall' ? 'normal' : undefined)};
  margin-top: 8px;
  margin-bottom: 8px;
`;

const IconContainer = styled.span<{
  $size: 'xsmall' | 'small' | 'large';
}>`
  font-size: ${(props) => ICON_FONT_SIZE[props.$size]};
  color: var(--text-color-dim);
`;

interface Props {
  size?: 'xsmall' | 'small' | 'large';
  icon?: ReactNode;
  title: string;
  message?: string;
  className?: string;
}

export const NullState = (props: Props) => {
  const size = props.size || 'large';

  return (
    <Container className={props.className}>
      {props.icon && <IconContainer $size={size}>{props.icon}</IconContainer>}
      <br />
      <div>
        <Header $size={size}>{props.title}</Header>
        {props.message && <span>{props.message}</span>}
      </div>
    </Container>
  );
};
