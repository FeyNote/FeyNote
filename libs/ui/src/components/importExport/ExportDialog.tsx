import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Flex, RadioGroup, Text } from '@radix-ui/themes';
import { getArtifactAccessLevel } from '@feynote/shared-utils';
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

const ArtifactListContainer = styled.div`
  position: relative;
  height: 300px;
  margin-bottom: 16px;
`;

const FormatOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
`;

interface Props {
  artifactIds: string[];
  close: () => void;
}

export const ExportDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { session } = useSessionContext();
  const { getArtifactSnapshotById } = useArtifactSnapshots();
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

  const [selectedArtifactIds, setSelectedArtifactIds] = useState<
    ReadonlySet<string>
  >(() => new Set(exportableArtifactSnapshots.map((el) => el.id)));

  const checkboxTableEntries = useMemo(
    () =>
      exportableArtifactSnapshots.map((snapshot) => ({
        key: snapshot.id,
        value: snapshot,
      })),
    [exportableArtifactSnapshots],
  );

  const startExport = async () => {
    const artifactIds = exportableArtifactSnapshots
      .map((el) => el.id)
      .filter((id) => selectedArtifactIds.has(id));

    try {
      await trpc.job.createExportJob.mutate({
        format,
        artifactIds,
      });
    } catch (e) {
      handleTRPCErrors(e);
      return;
    }

    navigate(undefined, PaneableComponent.Export, {}, PaneTransition.Push);
  };

  const getDescription = () => {
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
            disabled: !selectedArtifactIds.size,
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
              <Text size="2">
                {entry.value.meta.title || t('generic.untitled')}
              </Text>
            )}
          />
        </ArtifactListContainer>
      )}
      {!!exportableArtifactSnapshots.length && (
        <>
          <RadioGroup.Root
            value={format}
            onValueChange={(value) => {
              const option = EXPORT_OPTIONS.find((el) => el.format === value);
              if (option) setFormat(option.format);
            }}
          >
            <Flex direction="column" gap="3">
              {EXPORT_OPTIONS.map((option) => (
                <RadioGroup.Item key={option.format} value={option.format}>
                  <FormatOption>
                    <option.component />
                    <Flex direction="column">
                      <Text size="2" weight="medium">
                        {t(option.title)}
                      </Text>
                      <Text size="1" color="gray">
                        {t(option.description)}
                      </Text>
                    </Flex>
                  </FormatOption>
                </RadioGroup.Item>
              ))}
            </Flex>
          </RadioGroup.Root>
          <Text as="p" size="1" color="gray" mt="3">
            {t('export.options.subtext')}
          </Text>
        </>
      )}
    </ActionDialog>
  );
};
