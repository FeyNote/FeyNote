import { IonCard } from '@ionic/react';
import styled from 'styled-components';

export const ArtifactEditorContainer = styled(IonCard)`
  contain: unset;
  overflow: visible;

  margin-left: 0;
  margin-right: 0;
  margin-top: 3px; // We need this to prevent the card shadow from being clipped by the nav

  @media print {
    box-shadow: none;
  }
`;
