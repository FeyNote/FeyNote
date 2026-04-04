import styled from 'styled-components';

export const FeynoteCardItem = styled.div<{
  $isButton?: boolean;
}>`
  display: flex;
  align-items: center;
  min-height: 34px;
  font-size: 0.875rem;
  padding: 6px 16px;
  color: var(--text-color);
  border-radius: var(--card-border-radius);

  ${(props) =>
    props.$isButton &&
    `
    cursor: pointer;
    &:hover {
      background: var(--contrasting-element-background-hover);
    }
  `}
`;
