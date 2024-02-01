import { IonCard } from '@ionic/react';
import styled from 'styled-components';

export const IonArtifactCard = styled(IonCard)`
  width: min(300px, 100%);
`;

export const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-rows: 58px auto;
  height: 100%;
`;

export const GridRowSearchbar = styled.div`
  display: flex;
  padding-top: 8px;
  padding-left: 8px;
`;

export const GridRowArtifacts = styled.div`
  display: flex;
  overflow-y: auto;
`;
