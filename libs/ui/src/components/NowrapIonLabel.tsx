import { IonLabel } from '@ionic/react';
import styled from 'styled-components';

export const NowrapIonLabel = styled(IonLabel)`
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
