import { ActionDialog } from '../sharedComponents/ActionDialog';
import { WelcomeModal } from './WelcomeDialogContent';
import { useTranslation } from 'react-i18next';
import { memo, useEffect, useState } from 'react';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { welcomePendingSimpleref } from '../../utils/localDb/welcomePendingState';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';

export const WelcomeDialog: React.FC = memo(() => {
  const { t } = useTranslation();
  const { navigate } = useGlobalPaneContext();
  const [showWelcomeModal, setShowWelcomeModal] = useState(
    welcomePendingSimpleref.welcomePending,
  );

  useEffect(() => {
    const listener = (
      _: EventName,
      data: {
        welcomeId: string;
        introducingReferencesId: string;
      },
    ) => {
      navigate(
        undefined,
        PaneableComponent.Artifact,
        {
          id: data.welcomeId,
        },
        PaneTransition.Push,
        true,
      );
      navigate(
        undefined,
        PaneableComponent.Artifact,
        {
          id: data.introducingReferencesId,
        },
        PaneTransition.NewTab,
        false,
      );
    };

    eventManager.addEventListener(EventName.ArtifactWelcomeCreated, listener);

    return () => {
      eventManager.removeEventListener(
        EventName.ArtifactWelcomeCreated,
        listener,
      );
    };
  }, []);

  return (
    <ActionDialog
      title={t('welcome.title')}
      description={t('welcome.subtitle')}
      size="large"
      open={showWelcomeModal}
      onOpenChange={setShowWelcomeModal}
      actionButtons={[
        {
          title: t('generic.close'),
          props: {
            color: 'gray',
          },
        },
      ]}
    >
      <WelcomeModal dismiss={() => setShowWelcomeModal(false)} />
    </ActionDialog>
  );
});
