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
import { createPortal } from 'react-dom';
import { EventManager } from '../../context/events/EventManager';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';

interface Props {
  id: string;
  focusBlockId?: string;
  focusDate?: string;
}

export const Artifact: React.FC<Props> = (props) => {
  const [presentToast] = useIonToast();
  const { startProgressBar, ProgressBar } = useProgressBar();
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const [title, setTitle] = useState('');
  const { isPaneFocused } = useContext(PaneContext);
  const { sidemenuContentRef } = useContext(SidemenuContext);

  const load = () => {
    const progress = startProgressBar();
    trpc.artifact.getArtifactById
      .query({
        id: props.id,
      })
      .then((_artifact) => {
        setArtifact(_artifact);
        setTitle(_artifact.title);
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

  const onTitleChange = (updatedTitle: string) => {
    setTitle(updatedTitle);
  };

  return (
    <IonPage>
      <PaneNav
        title={title}
        popoverContents={<ArtifactContextMenu artifactId={props.id} />}
      />
      <IonContent className="ion-padding-start ion-padding-end">
        {ProgressBar}
        {artifact && (
          <ArtifactRenderer
            artifact={artifact}
            scrollToBlockId={props.focusBlockId}
            scrollToDate={props.focusDate}
            onTitleChange={onTitleChange}
          />
        )}
      </IonContent>
      {artifact &&
        isPaneFocused &&
        sidemenuContentRef.current &&
        createPortal(
          <ArtifactRightSidemenu
            key={artifact.id}
            artifact={artifact}
            reload={load}
          />,
          sidemenuContentRef.current,
        )}
    </IonPage>
  );
};
