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
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { cog, link, person } from 'ionicons/icons';
import { CompactIonItem } from '../CompactIonItem';
import { NowrapIonLabel } from '../NowrapIonLabel';
import { ArtifactSharingManagementModal } from './ArtifactSharingManagementModal';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { useIsEditable } from '../../utils/useAuthorizedScope';
import { useEdgesForArtifactId } from '../../utils/edgesReferences/useEdgesForArtifactId';

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isEditable } = useIsEditable(props.connection);
  const [presentSharingModal, dismissSharingModal] = useIonModal(
    ArtifactSharingManagementModal,
    {
      artifactId: props.artifactId,
      dismiss: () => dismissSharingModal(),
    },
  );
  const { navigate } = useContext(PaneContext);
  const { session } = useContext(SessionContext);
  const { theme, titleBodyMerge } = useObserveYArtifactMeta(
    props.connection.yjsDoc,
  );
  const [artifact, setArtifact] = useState<ArtifactDTO>();
  const { incomingEdges, outgoingEdges } = useEdgesForArtifactId(
    props.artifactId,
  );

  useEffect(() => {
    setArtifact(undefined);
    trpc.artifact.getArtifactById
      .query({
        id: props.artifactId,
      })
      .then((response) => {
        setArtifact(response);
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  }, [props.artifactId]);

  const { handleTRPCErrors } = useHandleTRPCErrors();

  const setMetaProp = (metaPropName: keyof YArtifactMeta, value: any) => {
    (props.connection.yjsDoc.getMap(ARTIFACT_META_KEY) as any).set(
      metaPropName,
      value,
    );
  };

  const incomingArtifactReferenceTitles = useMemo(
    () =>
      Object.entries(
        incomingEdges.reduce<{
          [key: string]: string;
        }>((acc, el) => {
          // We don't want to show self-references in the incoming artifact references list
          if (el.artifactId === props.artifactId) return acc;

          acc[el.artifactId] = el.artifactTitle;
          return acc;
        }, {}),
      ),
    [incomingEdges],
  );

  const artifactReferenceTitles = useMemo(
    () =>
      Object.entries(
        outgoingEdges.reduce<{ [key: string]: string }>((acc, el) => {
          // We don't want to show broken references in the referenced artifact list
          if (el.isBroken) return acc;

          // We don't want to show self-references in the referenced artifact list
          if (el.targetArtifactId === props.artifactId) return acc;

          acc[el.targetArtifactId] = el.referenceText;
          return acc;
        }, {}),
      ),
    [outgoingEdges],
  );

  const artifactSettings = artifact?.userId === session.userId && (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={person} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.artifactShares')}
        <InfoButton message={t('artifactRenderer.artifactShares.help')} />
      </IonListHeader>
      {artifact.artifactShares.map((artifactShare) => (
        <CompactIonItem
          lines="none"
          key={artifactShare.id}
          onClick={() => presentSharingModal()}
          button
        >
          <NowrapIonLabel>{artifactShare.user.name}</NowrapIonLabel>
        </CompactIonItem>
      ))}
      {!!artifact.artifactShareTokens.length && (
        <CompactIonItem
          lines="none"
          onClick={() => presentSharingModal()}
          button
        >
          <NowrapIonLabel>{t('artifactRenderer.sharedByLink')}</NowrapIonLabel>
        </CompactIonItem>
      )}
      {!artifact.artifactShares.length &&
        !artifact.artifactShareTokens.length && (
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
  );

  const artifactSharingStatus = artifact &&
    artifact.userId !== session.userId && (
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
              name: artifact.user.name,
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
            checked={titleBodyMerge}
            onIonChange={async (event) => {
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
      </IonCard>
      {artifactSettings}
      {artifactSharingStatus}
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
