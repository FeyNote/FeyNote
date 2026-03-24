import { useEffect, useState } from 'react';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { ActionDialog } from '../../components/sharedComponents/ActionDialog';
import { useTranslation } from 'react-i18next';
import { getManifestDb, ObjectStoreName } from './localDb';

export const PendingFileUploadErrorHandler: React.FC = () => {
  const [failedFile, setFailedFile] = useState<{
    id: string;
    fileName: string;
  } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    return eventManager.addEventListener(
      EventName.LocaldbPendingFileUploadFailed,
      (data) => {
        setFailedFile(data);
      },
    );
  }, []);

  const handleDiscard = async () => {
    if (!failedFile) return;
    const manifestDb = await getManifestDb();
    await manifestDb.delete(ObjectStoreName.PendingFiles, failedFile.id);
    setFailedFile(null);
  };

  const handleRetry = async () => {
    if (!failedFile) return;
    const manifestDb = await getManifestDb();
    const doc = await manifestDb.get(
      ObjectStoreName.PendingFiles,
      failedFile.id,
    );
    if (doc) {
      await manifestDb.put(ObjectStoreName.PendingFiles, {
        ...doc,
        retryCount: 0,
      });
    }
    setFailedFile(null);
  };

  if (!failedFile) return;

  return (
    <ActionDialog
      open={!!failedFile}
      onOpenChange={(open) => {
        if (!open) setFailedFile(null);
      }}
      title={t('error.pendingFileUpload.title')}
      description={t('error.pendingFileUpload.description', {
        fileName: failedFile.fileName,
      })}
      actionButtons={[
        {
          title: t('error.pendingFileUpload.retry'),
          props: {
            onClick: handleRetry,
          },
        },
        {
          title: t('error.pendingFileUpload.discard'),
          props: {
            color: 'red',
            onClick: handleDiscard,
          },
        },
      ]}
    />
  );
};
