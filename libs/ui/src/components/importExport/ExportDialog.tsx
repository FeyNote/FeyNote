import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Flex, RadioGroup, Text } from '@radix-ui/themes';
import {
  getArtifactAccessLevel,
  MAX_EXPORT_ARTIFACT_COUNT,
} from '@feynote/shared-utils';
import type { ExportFormat } from '@feynote/prisma/types';
import type { ArtifactSnapshot } from '@feynote/global-types';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { CheckboxTable } from '../sharedComponents/CheckboxTable';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useSessionContext } from '../../context/session/SessionContext';
import {
  PaneTransition,
  useGlobalPaneContext,
} from '../../context/globalPane/GlobalPaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { trpc } from '../../utils/trpc';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { EXPORT_OPTIONS } from './EXPORT_OPTIONS';
import { ExportFormatLabel } from './ExportFormatLabel';

const ArtifactListContainer = styled.div`
  position: relative;
  height: 300px;
  margin-bottom: 16px;
`;

const ArtifactListItemTitle = styled.div`
  margin-left: 16px;
`;

interface Props {
  artifactIds: ReadonlySet<string>;
  close: () => void;
}

export const ExportDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { getArtifactSnapshotById, artifactSnapshotsLoading } =
    useArtifactSnapshots();
  const { navigate } = useGlobalPaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [format, setFormat] = useState<ExportFormat>('markdown');

  const exportableArtifactSnapshots = useMemo(() => {
    const snapshots: ArtifactSnapshot[] = [];
    for (const artifactId of props.artifactIds) {
      const snapshot = getArtifactSnapshotById(artifactId);
      if (!snapshot || snapshot.meta.deletedAt) continue;
      if (getArtifactAccessLevel(snapshot, session.userId) === 'noaccess') {
        continue;
      }
      snapshots.push(snapshot);
    }
    return snapshots;
  }, [props.artifactIds, getArtifactSnapshotById, session.userId]);

  const exportableArtifactIds = useMemo(
    () => exportableArtifactSnapshots.map((snapshot) => snapshot.id),
    [exportableArtifactSnapshots],
  );

  const [uncheckedArtifactIds, setUncheckedArtifactIds] = useState<
    ReadonlySet<string>
  >(new Set());

  const selectedArtifactIds = useMemo(
    () =>
      new Set(
        exportableArtifactIds.filter((id) => !uncheckedArtifactIds.has(id)),
      ),
    [exportableArtifactIds, uncheckedArtifactIds],
  );

  const setSelectedArtifactIds = (newSelectedIds: ReadonlySet<string>) => {
    setUncheckedArtifactIds(
      new Set(exportableArtifactIds.filter((id) => !newSelectedIds.has(id))),
    );
  };

  const tooManyArtifactsSelected =
    selectedArtifactIds.size > MAX_EXPORT_ARTIFACT_COUNT;

  const checkboxTableEntries = useMemo(
    () =>
      exportableArtifactSnapshots.map((snapshot) => ({
        key: snapshot.id,
        value: snapshot,
      })),
    [exportableArtifactSnapshots],
  );

  const startExport = async () => {
    const exportJob = await trpc.job.createExportJob
      .mutate({
        format,
        artifactIds: Array.from(selectedArtifactIds),
      })
      .catch((e) => {
        handleTRPCErrors(e);
      });
    if (!exportJob) return;

    navigate(undefined, PaneableComponent.Export, {}, PaneTransition.Push);
  };

  const getDescription = () => {
    if (artifactSnapshotsLoading) {
      return t('exportDialog.loading');
    }
    if (!exportableArtifactSnapshots.length) {
      return t('exportDialog.noDocuments');
    }
    if (exportableArtifactSnapshots.length === 1) {
      return t('exportDialog.description.single', {
        title:
          exportableArtifactSnapshots[0].meta.title || t('generic.untitled'),
      });
    }
    return t('exportDialog.description.multiple');
  };

  return (
    <ActionDialog
      title={t('exportDialog.title')}
      description={getDescription()}
      open={true}
      onOpenChange={(open) => {
        if (!open) props.close();
      }}
      size="large"
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('exportDialog.export'),
          props: {
            onClick: startExport,
            disabled:
              artifactSnapshotsLoading ||
              !selectedArtifactIds.size ||
              tooManyArtifactsSelected,
          },
        },
      ]}
    >
      {exportableArtifactSnapshots.length > 1 && (
        <ArtifactListContainer>
          <CheckboxTable
            items={checkboxTableEntries}
            selectedKeys={selectedArtifactIds}
            setSelectedKeys={setSelectedArtifactIds}
            showHeaderWithNoItems={false}
            headerItems={
              <Text size="2" color="gray">
                {t('exportDialog.selectedCount', {
                  selectedCount: selectedArtifactIds.size,
                  totalCount: exportableArtifactSnapshots.length,
                })}
              </Text>
            }
            renderItem={({ entry }) => (
              <ArtifactListItemTitle>
                <Text size="2">
                  {entry.value.meta.title || t('generic.untitled')}
                </Text>
              </ArtifactListItemTitle>
            )}
          />
        </ArtifactListContainer>
      )}
      {!!exportableArtifactSnapshots.length && (
        <>
          <RadioGroup.Root
            value={format}
            onValueChange={(value) => {
              const exportOption = EXPORT_OPTIONS.find(
                (option) => option.format === value,
              );
              if (exportOption) setFormat(exportOption.format);
            }}
          >
            <Flex direction="column" gap="3">
              {EXPORT_OPTIONS.map((option) => (
                <RadioGroup.Item key={option.format} value={option.format}>
                  <ExportFormatLabel option={option} />
                </RadioGroup.Item>
              ))}
            </Flex>
          </RadioGroup.Root>
          <Text as="p" size="1" color="gray" mt="3">
            {t('export.options.subtext')}
          </Text>
          {tooManyArtifactsSelected && (
            <Text as="p" size="2" color="red" mt="3">
              {t('exportDialog.tooManyDocuments', {
                maxCount: MAX_EXPORT_ARTIFACT_COUNT,
              })}
            </Text>
          )}
        </>
      )}
    </ActionDialog>
  );
};
