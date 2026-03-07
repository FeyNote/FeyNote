import { IonContent, IonPage } from '@ionic/react';
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
import { WorkspaceNewItemMode, PreferenceNames } from '@feynote/shared-utils';
import { addArtifactToWorkspaceWithSharingPrompt } from '../../utils/workspace/addArtifactToWorkspaceWithSharingPrompt';
import { addThreadToWorkspace } from '../../utils/workspace/addThreadToWorkspace';

export const CreateNew: React.FC = () => {
  const { navigate } = usePaneContext();
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getPreference, setPreference } = usePreferencesContext();
  const { showAlert } = useAlertContext();

  const handleWorkspaceAssociation = (
    itemId: string,
    type: 'artifact' | 'thread',
    navigateToItem: () => void,
  ) => {
    if (!currentWorkspaceId) {
      navigateToItem();
      return;
    }

    const mode = getPreference(PreferenceNames.WorkspaceNewItemMode);

    const addToWorkspace = async () => {
      if (type === 'thread') {
        await addThreadToWorkspace({
          workspaceId: currentWorkspaceId,
          threadId: itemId,
          showAlert,
        });
      } else {
        await addArtifactToWorkspaceWithSharingPrompt({
          workspaceId: currentWorkspaceId,
          artifactId: itemId,
          getPreference,
          setPreference,
          showAlert,
        });
      }
    };

    if (mode === WorkspaceNewItemMode.Always) {
      addToWorkspace()
        .then(navigateToItem)
        .catch((e) => {
          handleTRPCErrors(e);
          navigateToItem();
        });
      return;
    }

    if (mode === WorkspaceNewItemMode.Never) {
      navigateToItem();
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
              navigateToItem();
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
                .then(navigateToItem)
                .catch((e) => {
                  handleTRPCErrors(e);
                  navigateToItem();
                });
            },
          },
        },
        {
          title: t('createNew.addToWorkspace.no'),
          props: {
            onClick: () => {
              navigateToItem();
            },
          },
        },
        {
          title: t('createNew.addToWorkspace.yes'),
          props: {
            onClick: () => {
              addToWorkspace()
                .then(navigateToItem)
                .catch((e) => {
                  handleTRPCErrors(e);
                  navigateToItem();
                });
            },
          },
        },
      ],
    });
  };

  const newArtifact = async (type: ArtifactType) => {
    const result = await createArtifact({
      artifact: {
        title: t('generic.untitled'),
        type,
      },
    }).catch((error) => {
      handleTRPCErrors(error);
    });

    if (!result) return;

    handleWorkspaceAssociation(result.id, 'artifact', () => {
      navigate(
        PaneableComponent.Artifact,
        { id: result.id },
        PaneTransition.Replace,
      );
    });
  };

  const newAIThread = () => {
    trpc.ai.createThread
      .mutate({})
      .then((thread) => {
        handleWorkspaceAssociation(thread.id, 'thread', () => {
          navigate(
            PaneableComponent.AIThread,
            { id: thread.id },
            PaneTransition.Replace,
          );
        });
      })
      .catch((error) => {
        handleTRPCErrors(error);
      });
  };

  return (
    <IonPage id="main">
      <PaneNav title={t('createNew.title')} />
      <IonContent className="ion-padding">
        <CreateNewTypeSelector
          newArtifact={newArtifact}
          newAIThread={newAIThread}
        />
      </IonContent>
    </IonPage>
  );
};
