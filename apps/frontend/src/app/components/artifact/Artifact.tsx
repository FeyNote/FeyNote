import { ArtifactDTO } from '@feynote/prisma/types';
import { IonContent, IonPage, useIonToast } from '@ionic/react';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useState } from 'react';
import { ArtifactRenderer } from './ArtifactRenderer';
import { useProgressBar } from '../../../utils/useProgressBar';
import { PaneNav } from '../pane/PaneNav';
import { ArtifactContextMenu } from './ArtifactContextMenu';
import { SidemenuContext } from '../../context/sidemenu/SidemenuContext';
import { ArtifactRightSidemenu } from './ArtifactRightSidemenu';
import { PaneContext } from '../../context/pane/PaneContext';

interface Props {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const { pane, isPaneFocused } = useContext(PaneContext);
  const { setContents } = useContext(SidemenuContext);

  const load = () => {
    const progress = startProgressBar();
    trpc.artifact.getArtifactById
      .query({
        id: props.id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      })
      .finally(() => {
        progress.dismiss();
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (artifact && isPaneFocused) {
      setContents(
        <ArtifactRightSidemenu artifact={artifact} reload={load} />,
        pane.id,
      );
    }
  }, [artifact, isPaneFocused]);

  return (
    <IonPage>
      <PaneNav
        title={artifact?.title || ''}
        popoverContents={<ArtifactContextMenu artifactId={props.id} />}
      />
      <IonContent className="ion-padding">
        {ProgressBar}
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            reload={load}
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
          />
        )}
      </IonContent>
    </IonPage>
  );
};
