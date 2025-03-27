import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { ReadonlyArtifactViewer } from '../artifact/ReadonlySimpleArtifact';
import styled from 'styled-components';
import { LogoActionContainer } from '../sharedComponents/LogoActionContainer';
import { print } from 'ionicons/icons';

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

const PrintButton = styled(IonButton)`
  margin-left: auto;
`;

interface Props {
  artifactId: string;
}

export const ArtifactShareView: React.FC<Props> = (props) => {
  return (
    <IonPage>
      <IonContent>
        <Grid>
          <LogoActionContainer>
            <PrintButton
              color="dark"
              fill="clear"
              onClick={() => {
                window.open(`/artifact/print/${props.artifactId}`);
              }}
            >
              <IonIcon icon={print} slot="icon-only" />
            </PrintButton>
          </LogoActionContainer>
          <FloatingPresentation>
            <ReadonlyArtifactViewer artifactId={props.artifactId} />
          </FloatingPresentation>
        </Grid>
      </IonContent>
    </IonPage>
  );
};
