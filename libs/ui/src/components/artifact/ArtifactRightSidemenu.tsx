import {
  IonCard,
  IonCheckbox,
  IonIcon,
  IonListHeader,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { InfoButton } from '../info/InfoButton';
import type { YArtifactMeta } from '@feynote/global-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY } from '@feynote/shared-utils';
import { CollaborationManagerConnection } from '../editor/collaborationManager';
import { artifactThemeTitleI18nByName } from '../editor/artifactThemeTitleI18nByName';
import { cog, link } from 'ionicons/icons';
import { CompactIonItem } from '../CompactIonItem';
import { useObserveYArtifactMeta } from '../../utils/useObserveYArtifactMeta';
import { useEdgesForArtifactId } from '../../utils/edgesReferences/useEdgesForArtifactId';
import { ArtifactRightSidemenuReference } from './ArtifactRightSidemenuReference';
import { useIsEditable } from '../../utils/useAuthorizedScope';

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isEditable } = useIsEditable(props.connection);
  const { theme, titleBodyMerge } = useObserveYArtifactMeta(
    props.connection.yjsDoc,
  );
  const { incomingEdges, outgoingEdges } = useEdgesForArtifactId(
    props.artifactId,
  );

  const setMetaProp = (
    metaPropName: keyof YArtifactMeta,
    value: string | boolean,
  ) => {
    props.connection.yjsDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
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
            disabled={!isEditable}
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
            disabled={!isEditable}
          >
            {t('artifactRenderer.titleBodyMerge')}
          </IonCheckbox>
          <InfoButton
            slot="end"
            message={t('artifactRenderer.titleBodyMerge.help')}
          />
        </CompactIonItem>
      </IonCard>
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
              <ArtifactRightSidemenuReference
                key={otherArtifactId}
                otherArtifactId={otherArtifactId}
                otherArtifactTitle={otherArtifactTitle}
              />
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
              <ArtifactRightSidemenuReference
                key={otherArtifactId}
                otherArtifactId={otherArtifactId}
                otherArtifactTitle={otherArtifactTitle}
              />
            ),
          )}
        </IonCard>
      )}
    </>
  );
};
