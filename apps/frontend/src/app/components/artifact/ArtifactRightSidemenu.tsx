import {
  IonCheckbox,
  IonIcon,
  IonItem,
  IonLabel,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  useIonToast,
} from '@ionic/react';
import { InfoButton } from '../info/InfoButton';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { chevronForward } from 'ionicons/icons';
import type { ArtifactDTO } from '@feynote/prisma/types';
import { trpc } from '../../../utils/trpc';
import { handleTRPCErrors } from '../../../utils/handleTRPCErrors';
import { useContext, useEffect, useState } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import { artifactCollaborationManager } from '../editor/artifactCollaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { EventContext } from '../../context/events/EventContext';
import { EventName } from '../../context/events/EventName';
import { Artifact } from './Artifact';
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

interface Props {
  artifact: ArtifactDTO;
  reload: () => void;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentToast] = useIonToast();
  const { navigate } = useContext(PaneContext);
  const { session } = useContext(SessionContext);
  const { eventManager } = useContext(EventContext);
  const [title, setTitle] = useState(props.artifact.title);
  const [theme, setTheme] = useState(props.artifact.theme);

  const [isPinned, setIsPinned] = useState(props.artifact.isPinned);

  const connection = artifactCollaborationManager.get(
    props.artifact.id,
    session,
  );
  useEffect(() => {
    const artifactMetaMap = connection.yjsDoc.getMap('artifactMeta');

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(connection.yjsDoc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
    };

    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [connection]);

  const setMetaProp = (metaPropName: string, value: any) => {
    (connection.yjsDoc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const updateArtifact = async (updates: Partial<ArtifactDTO>) => {
    await trpc.artifact.updateArtifact
      .mutate({
        id: props.artifact.id,
        isPinned,
        isTemplate: false,
        rootTemplateId: null,
        artifactTemplateId: null,
        ...updates,
      })
      .then(() => {
        props.reload();
      })
      .catch((error) => {
        handleTRPCErrors(error, presentToast);
      });
  };

  return (
    <>
      <IonItem>
        <IonCheckbox
          labelPlacement="end"
          justify="start"
          checked={isPinned}
          onIonChange={async (event) => {
            setIsPinned(event.target.checked);
            await updateArtifact({
              isPinned: event.target.checked,
            });
            eventManager.broadcast([EventName.ArtifactPinned]);
          }}
        >
          {t('artifactRenderer.isPinned')}
        </IonCheckbox>
        <InfoButton slot="end" message={t('artifactRenderer.isPinned.help')} />
      </IonItem>
      <IonItem>
        <IonSelect
          label={t('artifactRenderer.theme')}
          labelPlacement="fixed"
          value={theme}
          onIonChange={(e) => {
            setMetaProp('theme', e.detail.value);
          }}
        >
          {Object.keys(artifactThemeTitleI18nByName).map((el) => (
            <IonSelectOption key={el} value={el}>
              {t(
                artifactThemeTitleI18nByName[
                  el as keyof typeof artifactThemeTitleI18nByName
                ],
              )}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      {!!props.artifact.incomingArtifactReferences.length && (
        <>
          <IonListHeader>
            {t('artifactRenderer.incomingArtifactReferences')}
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
            />
          </IonListHeader>
          {props.artifact.incomingArtifactReferences.map((el) => (
            <IonItem
              key={el.id}
              onClick={() =>
                navigate(
                  PaneableComponent.Artifact,
                  { id: el.artifactId },
                  PaneTransition.Push,
                )
              }
              button
            >
              <IonLabel>{el.artifact.title}</IonLabel>
              <IonIcon slot="end" icon={chevronForward} />
            </IonItem>
          ))}
        </>
      )}
    </>
  );
};
