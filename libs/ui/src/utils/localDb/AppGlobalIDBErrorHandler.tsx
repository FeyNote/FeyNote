import { useEffect, useState } from 'react';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { ActionDialog } from '../../components/sharedComponents/ActionDialog';
import { useTranslation } from 'react-i18next';

export const AppGlobalIDBErrorHandler: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    return eventManager.addEventListener(EventName.LocaldbIDBError, () => {
      setShowError(true);
    });
  }, []);

  if (!showError) return;

  return (
    <ActionDialog
      open={showError}
      onOpenChange={(open) => setShowError(open)}
      title={t('generic.error')}
      description={t('error.appIDB')}
      actionButtons={[
        {
          title: t('generic.reload'),
          props: {
            onClick: () => {
              window.location.reload();
            },
          },
        },
        {
          title: t('generic.ignore'),
          props: {
            color: 'red',
          },
        },
      ]}
    />
  );
};
