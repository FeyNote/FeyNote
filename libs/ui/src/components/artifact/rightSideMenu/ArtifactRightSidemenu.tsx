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
import { InfoButton } from '../../info/InfoButton';
import type { YArtifactMeta } from '@feynote/global-types';
import { trpc } from '../../../utils/trpc';
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_META_KEY, type Edge } from '@feynote/shared-utils';
import { CollaborationManagerConnection } from '../../editor/collaborationManager';
import { SessionContext } from '../../../context/session/SessionContext';
import { artifactThemeTitleI18nByName } from '../../editor/artifactThemeTitleI18nByName';
import { cog, link, person } from 'ionicons/icons';
import { CompactIonItem } from '../../CompactIonItem';
import { NowrapIonLabel } from '../../NowrapIonLabel';
import { ArtifactSharingManagementModal } from '../ArtifactSharingManagementModal';
import { useObserveYArtifactMeta } from '../../../utils/useObserveYArtifactMeta';
import { useIsEditable } from '../../../utils/useAuthorizedScope';
import { useEdgesForArtifactId } from '../../../utils/edgesReferences/useEdgesForArtifactId';
import { useObserveYArtifactUserAccess } from '../../../utils/useObserveYArtifactUserAccess';
import { IncomingReferencesFromArtifact } from './incomingReferences/IncomingReferencesFromArtifact';
import { OutgoingReferencesToArtifact } from './outgoingReferences/OutgoingReferencesToArtifact';
import type { TableOfContentData } from '@tiptap-pro/extension-table-of-contents';
import { ArtifactTableOfContents } from './ArtifactTableOfContents';

interface Props {
  artifactId: string;
  connection: CollaborationManagerConnection;
  onTocUpdateRef: RefObject<
    ((content: TableOfContentData) => void) | undefined
  >;
}

export const ArtifactRightSidemenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isEditable } = useIsEditable(props.connection);
  const [presentSharingModal, dismissSharingModal] = useIonModal(
    ArtifactSharingManagementModal,
    {
      artifactId: props.artifactId,
      connection: props.connection,
      dismiss: () => dismissSharingModal(),
    },
  );
  const { session } = useContext(SessionContext);
  const artifactMeta = useObserveYArtifactMeta(props.connection.yjsDoc);
  const { userAccessYKV, _rerenderReducerValue } =
    useObserveYArtifactUserAccess(props.connection.yjsDoc);
  const activeUserShares = useMemo(() => {
    return userAccessYKV.yarray
      .toArray()
      .filter((el) => el.val.accessLevel !== 'noaccess');
  }, [_rerenderReducerValue]);
  const { incomingEdges, outgoingEdges } = useEdgesForArtifactId(
    props.artifactId,
  );

  const [knownUsers, setKnownUsers] = useState<
    {
      id: string;
      email: string;
    }[]
  >([]);
  const knownUsersById = useMemo(() => {
    return new Map(knownUsers.map((el) => [el.id, el]));
  }, [knownUsers]);
  const getKnownUsers = async () => {
    await trpc.user.getKnownUsers
      .query()
      .then((result) => {
        setKnownUsers(result);
      })
      .catch(() => {
        // Do nothing, we don't care about errors here
      });
  };

  useEffect(() => {
    getKnownUsers();
  }, []);

  const setMetaProp = (
    metaPropName: keyof YArtifactMeta,
    value: string | boolean,
  ) => {
    props.connection.yjsDoc.getMap(ARTIFACT_META_KEY).set(metaPropName, value);
  };

  const incomingEdgesByArtifactId = useMemo(() => {
    return Object.entries(
      incomingEdges.reduce<{ [key: string]: Edge[] }>((acc, el) => {
        // We don't want to show self-references in the incoming artifact references list
        if (el.artifactId === props.artifactId) return acc;

        acc[el.artifactId] ||= [];
        acc[el.artifactId].push(el);
        return acc;
      }, {}),
    );
  }, [incomingEdges]);

  const outgoingEdgesByArtifactId = useMemo(() => {
    return Object.entries(
      outgoingEdges.reduce<{ [key: string]: Edge[] }>((acc, el) => {
        // We don't want to show broken references in the referenced artifact list
        if (el.isBroken) return acc;

        // We don't want to show self-references in the referenced artifact list
        if (el.targetArtifactId === props.artifactId) return acc;

        // We don't want to include broken references in the referenced artifact list (kinda TBD)
        if (!el.targetArtifactTitle) return acc;

        acc[el.targetArtifactId] ||= [];
        acc[el.targetArtifactId].push(el);
        return acc;
      }, {}),
    );
  }, [outgoingEdges]);

  const aritfactSettings = artifactMeta.userId === session.userId &&
    !artifactMeta.deletedAt && (
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
            value={artifactMeta.theme}
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
            checked={artifactMeta.titleBodyMerge}
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
    );

  const isOwner = artifactMeta.userId === session.userId;
  const isDeleted = !!artifactMeta.deletedAt;
  const artifactSharingSettings = isOwner && !isDeleted && (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={person} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.artifactShares')}
        <InfoButton message={t('artifactRenderer.artifactShares.help')} />
      </IonListHeader>
      {activeUserShares.map(({ key }) => (
        <CompactIonItem
          lines="none"
          key={key}
          onClick={() => presentSharingModal()}
          button
        >
          <NowrapIonLabel>
            {knownUsersById.get(key)?.email || key}
          </NowrapIonLabel>
        </CompactIonItem>
      ))}
      {artifactMeta.linkAccessLevel &&
        artifactMeta.linkAccessLevel !== 'noaccess' && (
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
      {!activeUserShares.length &&
        artifactMeta.linkAccessLevel === 'noaccess' && (
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

  const artifactSharingStatus = !isOwner && (
    <IonCard>
      <IonListHeader>
        <IonIcon icon={person} size="small" />
        &nbsp;&nbsp;
        {t('artifactRenderer.artifactSharedToYou')}
        <InfoButton message={t('artifactRenderer.artifactSharedToYou.help')} />
      </IonListHeader>
      <CompactIonItem lines="none">
        <IonLabel>
          {t('artifactRenderer.artifactSharedToYou.message', {
            name:
              knownUsersById.get(artifactMeta.userId || '')?.email ||
              artifactMeta.userId,
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
      {aritfactSettings}
      <ArtifactTableOfContents
        artifactId={props.artifactId}
        connection={props.connection}
        onTocUpdateRef={props.onTocUpdateRef}
      />
      {artifactSharingSettings}
      {artifactSharingStatus}
      {!!incomingEdgesByArtifactId.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.incomingArtifactReferences')}
            <InfoButton
              message={t('artifactRenderer.incomingArtifactReferences.help')}
            />
          </IonListHeader>
          {incomingEdgesByArtifactId.map(([artifactId, edges]) => (
            <IncomingReferencesFromArtifact key={artifactId} edges={edges} />
          ))}
        </IonCard>
      )}
      {!!outgoingEdgesByArtifactId.length && (
        <IonCard>
          <IonListHeader>
            <IonIcon icon={link} size="small" />
            &nbsp;&nbsp;
            {t('artifactRenderer.artifactReferences')}
            <InfoButton
              message={t('artifactRenderer.artifactReferences.help')}
            />
          </IonListHeader>
          {outgoingEdgesByArtifactId.map(([artifactId, edges]) => (
            <OutgoingReferencesToArtifact key={artifactId} edges={edges} />
          ))}
        </IonCard>
      )}
    </>
  );
};
