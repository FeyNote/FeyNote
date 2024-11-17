import {
  IonCard,
  IonCheckbox,
  IonIcon,
  IonLabel,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  useIonModal,
} from '@ionic/react';
import { InfoButton } from '../info/InfoButton';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import type { ArtifactDTO, YArtifactMeta } from '@feynote/global-types';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { useContext, useEffect, useMemo, useState } from 'react';
import { PaneContext } from '../../context/pane/PaneContext';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import { collaborationManager } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { cog, link, person } from 'ionicons/icons';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { ArtifactSharingManagementModal } from './ArtifactSharingManagementModal';
import { getIsEditable } from '../../utils/getIsEditable';

interface Props {
  artifact: ArtifactDTO;
  reload: () => void;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [presentSharingModal, dismissSharingModal] = useIonModal(
    ArtifactSharingManagementModal,
    {
      artifactId: props.artifact.id,
      dismiss: () => dismissSharingModal(),
    },
  );
  const { navigate } = useContext(PaneContext);
  const { session } = useContext(SessionContext);
  const [title, setTitle] = useState(props.artifact.title);
  const [theme, setTheme] = useState(props.artifact.theme);

  const [isPinned, setIsPinned] = useState(props.artifact.isPinned);
  const [enableTitleBodyMerge, setEnableTitleBodyMerge] = useState(false);
  const { handleTRPCErrors } = useHandleTRPCErrors();

  const connection = collaborationManager.get(
    `artifact:${props.artifact.id}`,
    session,
  );
  useEffect(() => {
    const artifactMetaMap = connection.yjsDoc.getMap('artifactMeta');

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(connection.yjsDoc);
      setTitle(yArtifactMeta.title ?? title);
      setTheme(yArtifactMeta.theme ?? theme);
      setEnableTitleBodyMerge(
        yArtifactMeta.titleBodyMerge ?? enableTitleBodyMerge,
      );
    };

    listener();
    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [connection]);

  const setMetaProp = (metaPropName: keyof YArtifactMeta, value: any) => {
    (connection.yjsDoc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const updateIsPinned = async (_isPinned: boolean) => {
    if (_isPinned) {
      await trpc.artifactPin.createArtifactPin
        .mutate({
          artifactId: props.artifact.id,
        })
        .then(() => {
          props.reload();
        })
        .catch((error) => {
          handleTRPCErrors(error);
        });
    } else {
      await trpc.artifactPin.deleteArtifactPin
        .mutate({
          artifactId: props.artifact.id,
        })
        .then(() => {
          props.reload();
        })
        .catch((error) => {
          handleTRPCErrors(error);
        });
    }
  };

  const isEditable = useMemo(
    () => getIsEditable(props.artifact, session.userId),
    [props.artifact, session.userId],
  );

  const incomingArtifactReferenceTitles = useMemo(
    () =>
      Object.entries(
        props.artifact.incomingArtifactReferences.reduce<{
          [key: string]: string;
        }>((acc, el) => {
          // We don't want to show self-references in the incoming artifact references list
          if (el.artifactId === props.artifact.id) return acc;

          acc[el.artifactId] = el.artifact.title;
          return acc;
        }, {}),
      ),
    [props.artifact],
  );

  const artifactReferenceTitles = useMemo(
    () =>
      Object.entries(
        props.artifact.artifactReferences.reduce<{ [key: string]: string }>(
          (acc, el) => {
            // We don't want to show broken references in the referenced artifact list
            if (!el.targetArtifact) return acc;

            // We don't want to show self-references in the referenced artifact list
            if (el.targetArtifactId === props.artifact.id) return acc;

            acc[el.targetArtifactId] = el.targetArtifact.title;
            return acc;
          },
          {},
        ),
      ),
    [props.artifact],
  );

  return (
    <>
      <IonCard>
        <IonListHeader>
          <IonIcon icon={cog} size="small" />
          &nbsp;&nbsp;
          {t('artifactRenderer.settings')}
        </IonListHeader>
        <CompactIonItem lines="none" button>
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
        </CompactIonItem>
        <CompactIonItem button lines="none">
          <IonCheckbox
            labelPlacement="end"
            justify="start"
            checked={enableTitleBodyMerge}
            onIonChange={async (event) => {
              setEnableTitleBodyMerge(event.target.checked);
              setMetaProp('titleBodyMerge', event.target.checked);
            }}
          >
            {t('artifactRenderer.titleBodyMerge')}
          </IonCheckbox>
          <InfoButton
            slot="end"
            message={t('artifactRenderer.titleBodyMerge.help')}
          />
        </CompactIonItem>
        <CompactIonItem button lines="none">
          <IonCheckbox
            labelPlacement="end"
            justify="start"
            checked={isPinned}
            onIonChange={async (event) => {
              setIsPinned(event.target.checked);
              await updateIsPinned(event.target.checked);
            }}
          >
            {t('artifactRenderer.isPinned')}
          </IonCheckbox>
          <InfoButton
            slot="end"
            message={t('artifactRenderer.isPinned.help')}
          />
        </CompactIonItem>
      </IonCard>
      {props.artifact.userId === session.userId && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactShares')}
            <InfoButton message={t('artifactRenderer.artifactShares.help')} />
          </IonListHeader>
          {props.artifact.artifactShares.map((artifactShare) => (
            <CompactIonItem
              lines="none"
              key={artifactShare.id}
              onClick={() => presentSharingModal()}
              button
            >
              <NowrapIonLabel>{artifactShare.user.name}</NowrapIonLabel>
            </CompactIonItem>
          ))}
          {!!props.artifact.artifactShareTokens.length && (
            <CompactIonItem
              lines="none"
              onClick={() => presentSharingModal()}
              button
            >
              <NowrapIonLabel>
                {t('artifactRenderer.sharedByLink')}
              </NowrapIonLabel>
            </CompactIonItem>
          )}
          {!props.artifact.artifactShares.length &&
            !props.artifact.artifactShareTokens.length && (
              <CompactIonItem lines="none">
                <NowrapIonLabel>
                  {t('artifactRenderer.artifactShares.null')}
                </NowrapIonLabel>
              </CompactIonItem>
            )}
          <CompactIonItem
            lines="none"
            button
            detail={true}
            onClick={() => presentSharingModal()}
          >
            <NowrapIonLabel>
              {t('artifactRenderer.artifactShares.manage')}
            </NowrapIonLabel>
          </CompactIonItem>
        </IonCard>
      )}
      {props.artifact.userId !== session.userId && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={person} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactSharedToYou')}
            <InfoButton
              message={t('artifactRenderer.artifactSharedToYou.help')}
            />
          </IonListHeader>
          <CompactIonItem lines="none">
            <IonLabel>
              {t('artifactRenderer.artifactSharedToYou.message', {
                name: props.artifact.user.name,
              })}
              <br />
              {t(
                isEditable
                  ? 'artifactRenderer.artifactSharedToYou.readwrite'
                  : 'artifactRenderer.artifactSharedToYou.readonly',
              )}
            </IonLabel>
          </CompactIonItem>
        </IonCard>
      )}
      {!!incomingArtifactReferenceTitles.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.incomingArtifactReferences')}
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
            />
          </IonListHeader>
          {incomingArtifactReferenceTitles.map(
            ([otherArtifactId, otherArtifactTitle]) => (
              <CompactIonItem
                lines="none"
                key={otherArtifactId}
                onClick={() =>
                  navigate(
                    PaneableComponent.Artifact,
                    { id: otherArtifactId },
                    PaneTransition.Push,
                  )
                }
                button
              >
                <NowrapIonLabel>{otherArtifactTitle}</NowrapIonLabel>
              </CompactIonItem>
            ),
          )}
        </IonCard>
      )}
      {!!artifactReferenceTitles.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactReferences')}
            <InfoButton
              message={t('artifactRenderer.artifactReferences.help')}
            />
          </IonListHeader>
          {artifactReferenceTitles.map(
            ([otherArtifactId, otherArtifactTitle]) => (
              <CompactIonItem
                lines="none"
                key={otherArtifactId}
                onClick={() =>
                  navigate(
                    PaneableComponent.Artifact,
                    { id: otherArtifactId },
                    PaneTransition.Push,
                  )
                }
                button
              >
                <NowrapIonLabel>{otherArtifactTitle}</NowrapIonLabel>
              </CompactIonItem>
            ),
          )}
        </IonCard>
      )}
    </>
  );
};
