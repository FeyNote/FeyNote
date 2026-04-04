import { useTranslation } from 'react-i18next';
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { usePaneContext } from '../../context/pane/PaneContext';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { uploadImportJob } from '../../utils/job/uploadImportJob';
import { ProgressBar } from '../info/ProgressBar';
import type { ImportFormat } from '@feynote/prisma/types';
import { PaneNav } from '../pane/PaneNav';
import {
  PaneContent,
  PaneContentContainer,
} from '../pane/PaneContentContainer';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WorkspaceIconBubble } from '../workspace/WorkspaceIconBubble';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { Button, Callout, Flex, Heading, Link, Text } from '@radix-ui/themes';
import { RxCross2 } from '../AppIcons';

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--general-background-hover);
  border-radius: 8px;
`;

const FileName = styled(Text)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropZone = styled.div<{ $dragging: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  border: 2px dashed
    ${(props) =>
      props.$dragging ? 'var(--accent-9)' : 'var(--general-background-hover)'};
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms;
  background: ${(props) =>
    props.$dragging ? 'var(--accent-a3)' : 'transparent'};

  &:hover {
    background: var(--general-background-hover);
  }
`;

interface Props {
  format: ImportFormat;
}

const FILE_SIZE_LIMIT = 500000000;
const ALLOWED_FILE_TYPES = ['application/zip', 'application/x-zip-compressed'];
const ALLOWED_FILE_TYPES_STR = ALLOWED_FILE_TYPES.join(', ');

const FORMAT_TITLE_KEYS: Record<ImportFormat, string> = {
  obsidian: 'importFileUpload.title.obsidian',
  logseq: 'importFileUpload.title.logseq',
  gDrive: 'importFileUpload.title.gDrive',
  docx: 'importFileUpload.title.docx',
  markdown: 'importFileUpload.title.markdown',
  text: 'importFileUpload.title.text',
};

const FORMAT_INSTRUCTION_KEYS: Record<ImportFormat, string> = {
  obsidian: 'importFileUpload.instructions.obsidian',
  logseq: 'importFileUpload.instructions.logseq',
  gDrive: 'importFileUpload.instructions.gDrive',
  docx: 'importFileUpload.instructions.default',
  markdown: 'importFileUpload.instructions.default',
  text: 'importFileUpload.instructions.default',
};

const FORMAT_DOCS_LINK: Record<ImportFormat, string> = {
  obsidian: 'https://docs.feynote.com/settings/import/obsidian/',
  logseq: 'https://docs.feynote.com/settings/import/logseq/',
  gDrive: 'https://docs.feynote.com/settings/import/googledrive/',
  docx: 'https://docs.feynote.com/settings/import/generic/',
  markdown: 'https://docs.feynote.com/settings/import/generic/',
  text: 'https://docs.feynote.com/settings/import/generic/',
};

export const ImportFileUpload: React.FC<Props> = (props: Props) => {
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { navigate } = usePaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getWorkspaceSnapshotById } = useWorkspaceSnapshots();

  const [file, setFile] = useState<File | null>(null);
  const [fileInputError, setFileInputError] = useState<string | null>(null);
  const [disableUploadBtn, setDisableUploadBtn] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState<number | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  const workspaceSnapshot = currentWorkspaceId
    ? getWorkspaceSnapshotById(currentWorkspaceId)
    : null;

  useEffect(() => {
    const prevent = (e: globalThis.DragEvent) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  const pageTitle = useMemo(
    () => t(FORMAT_TITLE_KEYS[props.format]),
    [props.format, t],
  );

  const instructions = useMemo(
    () => t(FORMAT_INSTRUCTION_KEYS[props.format]),
    [props.format, t],
  );

  const docsLink = FORMAT_DOCS_LINK[props.format];

  const validateAndSetFile = (selectedFile: File) => {
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFileInputError(
        t('import.file.error.type', { fileTypes: ALLOWED_FILE_TYPES_STR }),
      );
      return;
    }
    if (selectedFile.size >= FILE_SIZE_LIMIT) {
      setFileInputError(
        t('import.file.error.size', { fileSize: FILE_SIZE_LIMIT / 100000 }),
      );
      return;
    }
    setFile(selectedFile);
    setFileInputError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!e.dataTransfer.files?.length) return;
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const clearFileSelection = () => {
    setFile(null);
    setFileInputError(null);
    if (fileUploadRef.current) fileUploadRef.current.value = '';
  };

  const uploadFile = async () => {
    if (!file) return;
    setDisableUploadBtn(true);
    try {
      await uploadImportJob({
        file,
        format: props.format,
        onProgress: (progress) => setFileUploadProgress(progress),
        workspaceId: currentWorkspaceId,
      });
      navigate(PaneableComponent.Import, {}, PaneTransition.Push);
    } catch (e) {
      handleTRPCErrors(e, {
        413: t('import.file.error.size', {
          fileSize: FILE_SIZE_LIMIT / 100000,
        }),
        429: t('import.job.error.limit'),
      });
      console.error(e);
    }
    setDisableUploadBtn(false);
  };

  return (
    <PaneContentContainer>
      <PaneNav title={pageTitle} />
      <PaneContent>
        <Flex direction="column" gap="4" pt="2">
          <div>
            <Heading as="h2" size="3">
              {pageTitle}
            </Heading>
            <Text size="2" color="gray">
              {instructions}{' '}
              <Link size="2" href={docsLink} target="_blank" rel="noreferrer">
                {t('importFileUpload.help')}
              </Link>
            </Text>
          </div>

          {workspaceSnapshot && (
            <Callout.Root size="1" variant="surface">
              <Callout.Icon>
                <WorkspaceIconBubble
                  icon={workspaceSnapshot.meta.icon}
                  color={workspaceSnapshot.meta.color}
                  size={18}
                />
              </Callout.Icon>
              <Callout.Text>
                {t('import.workspace', {
                  workspaceName: workspaceSnapshot.meta.name,
                })}
              </Callout.Text>
            </Callout.Root>
          )}

          {file ? (
            <div>
              <FileRow>
                <FileName size="2">{file.name}</FileName>
                <Button
                  variant="ghost"
                  size="1"
                  color="gray"
                  onClick={clearFileSelection}
                >
                  <RxCross2 />
                </Button>
              </FileRow>
              {fileUploadProgress !== null && (
                <ProgressBar progress={fileUploadProgress} />
              )}
              <Button
                disabled={disableUploadBtn}
                size="2"
                onClick={uploadFile}
                style={{ marginTop: 12 }}
              >
                {t('generic.submit')}
              </Button>
            </div>
          ) : (
            <DropZone
              $dragging={dragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileUploadRef.current?.click()}
            >
              <Text size="2" color="gray">
                {t('import.file.browse')}
              </Text>
              <input
                ref={fileUploadRef}
                hidden={true}
                accept={ALLOWED_FILE_TYPES_STR}
                type="file"
                onChange={handleFileChange}
              />
            </DropZone>
          )}

          {fileInputError && (
            <Callout.Root color="red" size="1" variant="surface">
              <Callout.Text>{fileInputError}</Callout.Text>
            </Callout.Root>
          )}
        </Flex>
      </PaneContent>
    </PaneContentContainer>
  );
};
