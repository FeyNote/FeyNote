import { Button, DropdownMenu } from '@radix-ui/themes';
import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { LuHeading, LuList } from 'react-icons/lu';
import styled from 'styled-components';
import {
  RiAlignLeft,
  RiFileCopyLine,
  RiFontFamily,
  RiPrinterLine,
  RiText,
} from 'react-icons/ri';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { openArtifactPrint } from '../../utils/openArtifactPrint';
import { Doc as YDoc } from 'yjs';
import { usePaneContext } from '../../context/pane/PaneContext';
import { duplicateArtifact } from '../../utils/duplicateArtifact';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import { IoAdd } from 'react-icons/io5';
import {
  globalTiptapCommandHelpers,
  type GlobalTiptapCommandHelperEntry,
} from './globalTiptapCommandHelpers';
import { useState } from 'react';
import { NewArtifactDialog } from '../artifact/NewArtifactDialog';

const ControlMenuList = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 8px;
`;

interface Props {
  artifactId: string;
  editor: Editor;
  yDoc: YDoc;
  authorizedScope: CollaborationConnectionAuthorizedScope;
}

export const TiptapEditorControlMenu: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { navigate } = usePaneContext();
  const { handleTRPCErrors } = useHandleTRPCErrors();
  const [newArtifactAsChild, setNewArtifactAsChild] = useState(false);
  const [newArtifactDialogOpen, setNewArtifactDialogOpen] = useState(false);

  const onDuplicateArtifactClicked = async () => {
    const id = await duplicateArtifact(props.yDoc).catch((e) => {
      handleTRPCErrors(e);
    });

    if (!id) {
      return;
    }

    navigate(PaneableComponent.Artifact, { id: id }, PaneTransition.NewTab);
  };

  const renderCommandEntryItem = (
    commandEntry: GlobalTiptapCommandHelperEntry,
  ) => (
    <DropdownMenu.Item
      onClick={() =>
        commandEntry.command(props.editor, props.editor.state.selection)
      }
      disabled={!commandEntry.enabled(props.editor)}
    >
      {commandEntry.icon && <commandEntry.icon />}
      <span style={commandEntry.style}>{t(commandEntry.title)}</span>
    </DropdownMenu.Item>
  );

  const isEditable = [
    CollaborationConnectionAuthorizedScope.CoOwner,
    CollaborationConnectionAuthorizedScope.CoOwner,
  ].includes(props.authorizedScope);

  const file = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.file')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onClick={() => {
            setNewArtifactDialogOpen(true);
            setNewArtifactAsChild(false);
          }}
        >
          <IoAdd />
          {t('tiptapControlMenu.file.new')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            setNewArtifactDialogOpen(true);
            setNewArtifactAsChild(true);
          }}
        >
          <IoAdd />
          {t('artifactTree.newArtifactWithin')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onDuplicateArtifactClicked()}>
          <RiFileCopyLine />
          {t('tiptapControlMenu.file.duplicate')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => openArtifactPrint(props.artifactId)}>
          <RiPrinterLine />
          {t('tiptapControlMenu.file.print')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const edit = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.edit')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.undo)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.redo)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.cut)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.copy)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.selectAll)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.edit.delete)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const insert = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.insert')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.hr)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.table)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.monster)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.wideMonster)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.spell)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.note)}
        {renderCommandEntryItem(globalTiptapCommandHelpers.insert.link)}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  const format = (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          {t('tiptapControlMenu.format')}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiText />
            {t('tiptapControlMenu.format.text')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.text.toggleBold,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.text.toggleItalic,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.text.toggleUnderline,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.text.toggleStrike,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiFontFamily />
            {t('tiptapControlMenu.format.font')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.default,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.sans,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.serif,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.libreBaskerville,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.mrEavesRemake,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.allison,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.italianno,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.font.monsieurLaDoulaise,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <RiAlignLeft />
            {t('tiptapControlMenu.format.align')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.align.left,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.align.center,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.align.right,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />

        {renderCommandEntryItem(globalTiptapCommandHelpers.format.paragraph)}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <LuHeading />
            {t('tiptapControlMenu.format.h')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h1,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h2,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h3,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h4,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h5,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.heading.h6,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <LuList />
            {t('tiptapControlMenu.format.list')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.sinkBlock,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.liftBlock,
            )}
            <DropdownMenu.Separator />
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.list.bulletList,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.list.orderedList,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.list.taskList,
            )}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <>
      <ControlMenuList>
        {file}
        {isEditable && edit}
        {isEditable && insert}
        {isEditable && format}
      </ControlMenuList>
      <NewArtifactDialog
        open={newArtifactDialogOpen}
        onOpenChange={(open) => {
          setNewArtifactDialogOpen(open);
        }}
        tree={
          newArtifactAsChild
            ? {
                parentArtifactId: props.artifactId,
                order: 'X',
              }
            : undefined
        }
      />
    </>
  );
};
