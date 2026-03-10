import { IonContent, IonPage } from '@ionic/react';
import { useState, useMemo } from 'react';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { useTranslation } from 'react-i18next';
import type { ArtifactType } from '@prisma/client';
import { PaneNav } from '../pane/PaneNav';
import { CreateNewTypeSelector } from '../editor/CreateNewTypeSelector';
import { createArtifact } from '../../utils/localDb/createArtifact';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { useAlertContext } from '../../context/alert/AlertContext';
import {
  WorkspaceNewItemMode,
  PreferenceNames,
  getWorkspaceAccessLevel,
  getAccessLevelCanEdit,
} from '@feynote/shared-utils';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';
import { addThreadToWorkspace } from '../../utils/workspace/addThreadToWorkspace';
import { useWorkspaceSnapshot } from '../../utils/localDb/workspaces/useWorkspaceSnapshot';
import { useSessionContext } from '../../context/session/SessionContext';
import { ActionDialog } from '../sharedComponents/ActionDialog';

type NewItemArgs =
  | { kind: 'artifact'; artifactType: ArtifactType }
  | { kind: 'thread' };

export const CreateNew: React.FC = () => {
  const { navigate } = usePaneContext();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();
  const { workspaceSnapshot } = useWorkspaceSnapshot(
    currentWorkspaceId ?? undefined,
  );
  const { session } = useSessionContext();
  const [
    readOnlyWorkspaceItemPendingCreation,
    setReadOnlyWorkspaceItemPendingCreation,
  ] = useState<NewItemArgs | null>(null);

  const isCurrentWorkspaceReadOnly = useMemo(() => {
    if (!currentWorkspaceId || !workspaceSnapshot) return false;
    return !getAccessLevelCanEdit(
      getWorkspaceAccessLevel(workspaceSnapshot, session.userId),
    );
  }, [currentWorkspaceId, workspaceSnapshot, session.userId]);

  const createItem = async (spec: NewItemArgs) => {
    if (spec.kind === 'thread') {
      const thread = await trpc.ai.createThread.mutate({}).catch((error) => {
        handleTRPCErrors(error);
      });
      if (!thread) return null;
      return { id: thread.id, type: 'thread' as const };
    }
    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type: spec.artifactType,
      },
    }).catch((error) => {
      handleTRPCErrors(error);
    });
    if (!result) return null;
    return { id: result.id, type: 'artifact' as const };
  };

  const navigateToItem = (item: {
    id: string;
    type: 'artifact' | 'thread';
  }) => {
    navigate(
      item.type === 'thread'
        ? PaneableComponent.AIThread
        : PaneableComponent.Artifact,
      { id: item.id },
      PaneTransition.Replace,
    );
  };

  const handleWorkspaceAssociation = (item: {
    id: string;
    type: 'artifact' | 'thread';
  }) => {
    if (!currentWorkspaceId) {
      navigateToItem(item);
      return;
    }

    const mode = getPreference(PreferenceNames.WorkspaceNewItemMode);

    const addToWorkspace = async () => {
      if (item.type === 'thread') {
        await addThreadToWorkspace({
          workspaceId: currentWorkspaceId,
          threadId: item.id,
          showAlert,
        });
      } else {
        await addArtifactToWorkspaceWithSharingPrompt({
          workspaceId: currentWorkspaceId,
          artifactId: item.id,
          getPreference,
          setPreference,
          showAlert,
        });
      }
    };

    if (mode === WorkspaceNewItemMode.Always) {
      addToWorkspace()
        .then(() => navigateToItem(item))
        .catch((e) => {
          handleTRPCErrors(e);
          navigateToItem(item);
        });
      return;
    }

    if (mode === WorkspaceNewItemMode.Never) {
      navigateToItem(item);
      return;
    }

    showAlert({
      title: t('createNew.addToWorkspace.title'),
      description: t('createNew.addToWorkspace.message'),
      actionButtons: [
        {
          title: t('createNew.addToWorkspace.never'),
          props: {
            onClick: () => {
              setPreference(
                PreferenceNames.WorkspaceNewItemMode,
                WorkspaceNewItemMode.Never,
              );
              navigateToItem(item);
            },
          },
        },
        {
          title: t('createNew.addToWorkspace.always'),
          props: {
            onClick: () => {
              setPreference(
                PreferenceNames.WorkspaceNewItemMode,
                WorkspaceNewItemMode.Always,
              );
              addToWorkspace()
                .then(() => navigateToItem(item))
                .catch((e) => {
                  handleTRPCErrors(e);
                  navigateToItem(item);
                });
            },
          },
        },
        {
          title: t('createNew.addToWorkspace.no'),
          props: {
            onClick: () => {
              navigateToItem(item);
            },
          },
        },
        {
          title: t('createNew.addToWorkspace.yes'),
          props: {
            onClick: () => {
              addToWorkspace()
                .then(() => navigateToItem(item))
                .catch((e) => {
                  handleTRPCErrors(e);
                  navigateToItem(item);
                });
            },
          },
        },
      ],
    });
  };

  const handleNewItem = async (spec: NewItemArgs) => {
    if (isCurrentWorkspaceReadOnly) {
      setReadOnlyWorkspaceItemPendingCreation(spec);
      return;
    }
    const item = await createItem(spec);
    if (!item) return;
    handleWorkspaceAssociation(item);
  };

  return (
    <IonPage id="main">
      <PaneNav title={t('createNew.title')} />
      <IonContent className="ion-padding">
        <CreateNewTypeSelector
          newArtifact={(type) =>
            handleNewItem({ kind: 'artifact', artifactType: type })
          }
          newAIThread={() => handleNewItem({ kind: 'thread' })}
        />
      </IonContent>
      <ActionDialog
        open={!!readOnlyWorkspaceItemPendingCreation}
        onOpenChange={(open) => {
          if (!open) {
            setReadOnlyWorkspaceItemPendingCreation(null);
          }
        }}
        title={t('createNew.readOnlyWorkspace.title')}
        description={t('createNew.readOnlyWorkspace.message')}
        actionButtons={[
          {
            title: t('generic.cancel'),
            props: {
              variant: 'soft',
              color: 'gray',
            },
          },
          {
            title: t('generic.confirm'),
            props: {
              onClick: async () => {
                if (!readOnlyWorkspaceItemPendingCreation) return;
                const item = await createItem(
                  readOnlyWorkspaceItemPendingCreation,
                );
                if (item) navigateToItem(item);
              },
            },
          },
        ]}
      />
    </IonPage>
  );
};
