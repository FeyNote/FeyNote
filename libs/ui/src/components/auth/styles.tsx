import { IonCard, IonCardHeader, IonContent, IonText } from '@ionic/react';
import styled from 'styled-components';
import { SignInWithGoogle } from './SignInWithGoogle';

export const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const CenteredIonCardHeader = styled(IonCardHeader)`
  align-items: center;
`;

export const CenteredIonText = styled(IonText)`
  width: 100%;
  text-align: center;
`;

export const CenteredIonInputContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

export const CenteredIonCard = styled(IonCard)`
  max-width: 750px;
  margin: 0 auto;
`;

export const SignInWithGoogleButton = styled(SignInWithGoogle)`
  padding-top: 12px;
  display: flex;
  justify-content: center;
`;

export const IonContentFantasyBackground = styled(IonContent)`
  --background: url('https://static.feynote.com/art/czepeku-medusaswake-2240x3290-20240924.jpg')
    top center / cover no-repeat fixed padding-box content-box
    var(--ion-background-color, #ffffff);
`;
