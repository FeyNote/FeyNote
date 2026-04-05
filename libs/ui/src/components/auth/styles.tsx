import styled from 'styled-components';
import { PaneContent } from '../pane/PaneContentContainer';
import { SignInWithGoogle } from './SignInWithGoogle';

export const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const AuthCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
`;

export const AuthCardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
`;

export const AuthCardSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-dim);
`;

export const AuthCardContent = styled.div`
  padding: 0 16px 16px;
`;

export const AuthCenteredText = styled.div`
  width: 100%;
  text-align: center;
  padding: 8px 0;
  color: var(--text-color);
`;

export const AuthInputContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AuthCard = styled.div`
  max-width: 750px;
  margin: 0 auto;
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

export const SignInWithGoogleButton = styled(SignInWithGoogle)`
  padding-top: 12px;
  display: flex;
  justify-content: center;
`;

export const FantasyBackground = styled(PaneContent)`
  grid-row: 1 / -1;
  padding-left: 0;
  padding-right: 0;
  min-height: 100vh;
  background: url('https://static.feynote.com/art/czepeku-medusaswake-2240x3290-20240924.jpg')
    top center / cover no-repeat fixed padding-box content-box
    var(--background-color, #ffffff);
`;
