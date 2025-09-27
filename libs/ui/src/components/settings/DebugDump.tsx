import { useState } from 'react';
import { ActionDialog } from '../sharedComponents/ActionDialog';
import { useTranslation } from 'react-i18next';
import { downloadBlobpartsAsFile } from '../../utils/downloadBlobpartsAsFile';
import { createDebugDump } from '../../utils/localDb/debugStore';
import { Grid, Switch } from '@radix-ui/themes';
import {
  DEBUG_DUMP_PUBLIC_KEY,
  encryptUtf8WithRSAKey,
} from '@feynote/shared-utils';

interface Props {
  children: React.ReactNode;
}

export const DebugDump: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [showUI, setShowUI] = useState(false);
  const [debugIncludeArtifacts, setDebugIncludeArtifacts] = useState(false);
  const [debugIncludeTree, setDebugIncludeTree] = useState(false);

  const downloadDebugFile = async () => {
    const dump = await createDebugDump({
      withArtifacts: debugIncludeArtifacts,
      withTree: debugIncludeTree,
    });

    const encryptedDump = await encryptUtf8WithRSAKey(
      JSON.stringify(dump),
      DEBUG_DUMP_PUBLIC_KEY,
    );

    downloadBlobpartsAsFile({
      data: [JSON.stringify(encryptedDump)],
      mimetype: 'application/json',
      filename: `feynote-debugDump-${Date.now()}.json`,
    });
  };

  const debugDownloadDialog = (
    <ActionDialog
      open={showUI}
      onOpenChange={setShowUI}
      title={t('settings.help.debugDownload.title')}
      description={t('settings.help.debugDownload.description')}
      children={
        <Grid
          columns="min-content auto"
          gapX="3"
          gapY="3"
          display="inline-grid"
          flow="row"
          align="center"
        >
          <Switch
            checked={debugIncludeArtifacts}
            onCheckedChange={setDebugIncludeArtifacts}
          />
          <span>{t('settings.help.debugDownload.includeArtifacts')}</span>

          <Switch
            checked={debugIncludeTree}
            onCheckedChange={setDebugIncludeTree}
          />
          <span>{t('settings.help.debugDownload.includeTree')}</span>
        </Grid>
      }
      actionButtons={[
        {
          title: t('generic.cancel'),
          props: {
            color: 'gray',
          },
        },
        {
          title: t('generic.confirm'),
          props: {
            onClick: () => {
              downloadDebugFile();
            },
          },
        },
      ]}
    />
  );

  return (
    <>
      <div
        onClick={() => {
          setShowUI(true);
        }}
      >
        {props.children}
      </div>
      {debugDownloadDialog}
    </>
  );
};
