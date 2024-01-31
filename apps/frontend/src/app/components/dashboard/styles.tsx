import { IonIcon, IonSearchbar } from '@ionic/react';
import styled from 'styled-components';

export const SearchContainer = styled.span`
  display: flex;
  justify-content: center;
`;

export const StyledIcon = styled(IonIcon)`
  margin-top: auto;
  margin-bottom: auto;
  opacity: 0.7;
  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;

export const FilterIcon = styled(StyledIcon)`
  margin-right: 12px;
`;

export const StyledIonSearchbar = styled(IonSearchbar)`
  max-width: 500px;
`;

export const StyledHeader = styled.h1`
  display: inline;
  margin-top: auto;
  margin-bottom: auto;
`;

export const PinnedItemsContainer = styled.div`
  margin-top: 16px;
  display: flex;
`;

export const StyledCarrot = styled(StyledIcon)<{ active?: boolean }>`
  transform: rotate(0deg);
  ${(props) => props.active && 'transform: rotate(90deg);'}
  transition: transform .5s linear;
`;
