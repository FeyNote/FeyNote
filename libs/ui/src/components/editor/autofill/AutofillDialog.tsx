import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  Flex,
  Spinner,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import type { JSONContent } from '@tiptap/core';
import { ActionDialog } from '../../sharedComponents/ActionDialog';
import { AutofillPreviewDialog } from './AutofillPreviewDialog';
import { trpc } from '../../../utils/trpc';
import { useHandleTRPCErrors } from '../../../utils/useHandleTRPCErrors';

type AutofillFormat = 'statblock' | 'widestatblock' | 'spellsheet' | 'table';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'text' | 'url';
  format: AutofillFormat;
  onInsert: (content: JSONContent[]) => void;
}

export const AutofillDialog: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<
    JSONContent[] | null
  >(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'preview' | 'insert' | null>(
    null,
  );

  const resetState = () => {
    setInputValue('');
    setIsLoading(false);
    setGeneratedContent(null);
    setPreviewOpen(false);
    setActiveButton(null);
  };

  const fetchContent = async (): Promise<JSONContent[] | null> => {
    if (generatedContent) {
      return generatedContent;
    }
    try {
      const source =
        props.mode === 'text'
          ? ({ type: 'text', text: inputValue } as const)
          : ({ type: 'url', url: inputValue } as const);

      const result = await trpc.ai.autofill.mutate({
        source,
        outputFormat: props.format,
      });
      setGeneratedContent(result);
      return result;
    } catch (e) {
      handleTRPCErrors(e);
      return null;
    }
  };

  const handlePreviewClick = async () => {
    setActiveButton('preview');
    setIsLoading(true);
    const content = await fetchContent();
    setIsLoading(false);
    setActiveButton(null);
    if (content) {
      setPreviewOpen(true);
    }
  };

  const handleInsertClick = async () => {
    setActiveButton('insert');
    setIsLoading(true);
    const content = await fetchContent();
    setIsLoading(false);
    setActiveButton(null);
    if (content) {
      props.onInsert(content);
      props.onOpenChange(false);
      resetState();
    }
  };

  const handlePreviewInsert = () => {
    if (generatedContent) {
      props.onInsert(generatedContent);
      setPreviewOpen(false);
      props.onOpenChange(false);
      resetState();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setGeneratedContent(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    props.onOpenChange(open);
  };

  return (
    <>
      <ActionDialog
        open={props.open}
        onOpenChange={handleOpenChange}
        title={
          props.mode === 'text'
            ? t('autofillDialog.text.title')
            : t('autofillDialog.url.title')
        }
        description={
          props.mode === 'text'
            ? t('autofillDialog.text.description')
            : t('autofillDialog.url.description')
        }
        size="large"
      >
        {props.mode === 'text' ? (
          <TextArea
            placeholder={t('autofillDialog.text.placeholder')}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            rows={14}
          />
        ) : (
          <TextField.Root
            placeholder={t('autofillDialog.url.placeholder')}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
          />
        )}
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {t('autofillDialog.cancel')}
            </Button>
          </Dialog.Close>
          <Button
            disabled={isLoading || !inputValue.trim()}
            onClick={handlePreviewClick}
            variant="soft"
          >
            {activeButton === 'preview' && <Spinner />}
            {t('autofillDialog.preview')}
          </Button>
          <Button
            disabled={isLoading || !inputValue.trim()}
            onClick={handleInsertClick}
          >
            {activeButton === 'insert' && <Spinner />}
            {t('autofillDialog.insert')}
          </Button>
        </Flex>
      </ActionDialog>
      <AutofillPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        content={generatedContent}
        onInsert={handlePreviewInsert}
      />
    </>
  );
};
