import { IonContent, IonPage } from '@ionic/react';
import { ReadonlyArtifactViewer } from './ReadonlySimpleArtifact';
import styled from 'styled-components';
import { LogoActionContainer } from '../../sharedComponents/LogoActionContainer';

const FloatingPresentation = styled.div`
  width: min(max(500px, 75%), 100%);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 100px;
  padding: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-rows: 100px auto;
  height: 100%;
`;

interface Props {
  artifactId: string;
  shareToken?: string;
}

export const ArtifactShareView: React.FC<Props> = (props) => {
  return (
    <IonPage>
      <IonContent>
        <Grid>
          <LogoActionContainer></LogoActionContainer>
          <FloatingPresentation>
            <ReadonlyArtifactViewer
              artifactId={props.artifactId}
              shareToken={props.shareToken}
            />
          </FloatingPresentation>
        </Grid>
      </IonContent>
    </IonPage>
  );
};
