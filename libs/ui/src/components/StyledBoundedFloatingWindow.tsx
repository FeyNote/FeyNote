import styled from 'styled-components';
import { BoundedFloatingWindow } from './BoundedFloatingWindow';

export const StyledBoundedFloatingWindow = styled(BoundedFloatingWindow)`
  overflow-y: auto;
  background: var(--ion-background-color, #ffffff);
  border: 1px solid var(--ion-background-color-step-100, #e0e0e0);
  box-shadow: 1px 1px 9px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 10px;
`;
