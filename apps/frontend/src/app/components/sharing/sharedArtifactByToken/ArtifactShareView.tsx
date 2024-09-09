import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { ReadonlyArtifactViewer } from './ReadonlySimpleArtifact';
import styled from 'styled-components';

const LogoActionContainer = styled.div`
  height: 100px;
  padding-left: 20px;
  padding-top: 20px;
`;

const ActionElements = styled.div`
  display: flex;
`;

const Logo = styled.a`
  font-size: 1.1rem;
  color: var(--ion-text-color, #000000);
  text-decoration: none;
`;

const FloatingPresentation = styled.div`
  max-width: max(500px, 75%);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  padding: 8px;
`;

interface Props {
  artifactId: string;
}

export const ArtifactShareView: React.FC<Props> = (props) => {
  const shareToken =
    new URLSearchParams(window.location.search).get('shareToken') || undefined;

  return (
    <IonPage>
      <IonContent>
        <LogoActionContainer>
          <ActionElements>
            <Logo href="https://feynote.com">FeyNote</Logo>
          </ActionElements>
        </LogoActionContainer>
        <FloatingPresentation>
          <ReadonlyArtifactViewer
            artifactId={props.artifactId}
            shareToken={shareToken}
          />
        </FloatingPresentation>
      </IonContent>
    </IonPage>
  );
};
