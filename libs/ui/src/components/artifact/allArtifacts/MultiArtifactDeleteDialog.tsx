import { useState } from 'react';
import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import { useArtifactDeleteOrRemoveSelf } from '../useArtifactDeleteOrRemoveSelf';

const DELETE_RATE_LIMIT_WAIT_MS = 500;

interface Props {
  artifactIds: ReadonlySet<string>;
  close: () => void;
}

export const MultiArtifactDeleteDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [resultStats, setResultStats] = useState<{
    workingSetSize: number;
    total: number;
    success: number;
    failed: number;
  }>();

  const { deleteArtifactOrRemoveSelf } = useArtifactDeleteOrRemoveSelf();

  const deleteAction = async () => {
    setResultStats({
      workingSetSize: props.artifactIds.size,
      total: 0,
      success: 0,
      failed: 0,
    });

    let successCount = 0;
    let failedCount = 0;
    for (const artifactId of props.artifactIds) {
      try {
        await deleteArtifactOrRemoveSelf(artifactId);
        successCount++;
      } catch (e) {
        failedCount++;
        Sentry.captureException(e);
      }

      setResultStats({
        workingSetSize: props.artifactIds.size,
        total: successCount + failedCount,
        success: successCount,
        failed: failedCount,
      });

      await new Promise((resolve) => {
        setTimeout(resolve, DELETE_RATE_LIMIT_WAIT_MS);
      });
    }

    setResultStats({
      workingSetSize: props.artifactIds.size,
      total: props.artifactIds.size,
      success: successCount,
      failed: failedCount,
    });
  };

  const processingStatusDialog = (
    <ActionDialog
      title={t('allArtifacts.deleteMultiple.deleting.title')}
      description={`${t('allArtifacts.deleteMultiple.deleting.message', {
        totalCount: resultStats?.workingSetSize,
        successCount: resultStats?.success,
      })} ${
        resultStats?.failed
          ? t('allArtifacts.deleteMultiple.deleting.message.failed', {
              count: resultStats?.failed,
            })
          : ''
      }`}
      open={!!resultStats}
      onOpenChange={() => {
        if (resultStats?.total !== resultStats?.workingSetSize) {
          props.close();
        }
      }}
      actionButtons={[
        {
          title: t('generic.close'),
          props: {
            onClick: () => props.close(),
            disabled: resultStats?.total !== resultStats?.workingSetSize,
          },
        },
      ]}
    />
  );

  return (
    <>
      <ActionDialog
        title={t('allArtifacts.deleteMultiple.confirm.title')}
        description={t('allArtifacts.deleteMultiple.confirm.message', {
          count: props.artifactIds.size,
        })}
        open={true}
        actionButtons={[
          {
            title: t('generic.cancel'),
            props: {
              color: 'gray',
              onClick: props.close,
            },
          },
          {
            title: t('generic.confirm'),
            props: {
              onClick: deleteAction,
            },
          },
        ]}
      />
      {processingStatusDialog}
    </>
  );
};
