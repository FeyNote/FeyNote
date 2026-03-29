import styled from 'styled-components';

export const SidemenuCard = styled.div`
  background: var(--card-background);
  border-radius: 4px;
  margin: 8px 8px 0 8px;
  box-shadow: var(--card-box-shadow);
  overflow-y: auto;
`;

export const SidemenuCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border-bottom: 1px solid var(--gray-a4);
  color: var(--text-color-dim);
`;

export const SidemenuCardHeaderLabel = styled.span`
  flex: 1;
`;

export const SidemenuCardItem = styled.div<{
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

export const SidemenuCardItemLabel = styled.span`
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SidemenuCardItemSublabel = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-color-dim);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SidemenuCardItemEndSlot = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  flex-shrink: 0;
`;
