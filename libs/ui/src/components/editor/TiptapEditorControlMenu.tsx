import { Button, DropdownMenu } from '@radix-ui/themes';
import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  RiAlignLeft,
  RiFileCopyLine,
  RiFontFamily,
  RiPrinterLine,
  RiText,
  LuHeading,
  LuList,
  IoAdd,
  LuTable,
} from '../AppIcons';
import { CollaborationConnectionAuthorizedScope } from '../../utils/collaboration/useCollaborationConnectionAuthorizedScope';
import { openArtifactPrint } from '../../utils/openArtifactPrint';
import { Doc as YDoc } from 'yjs';
import { usePaneContext } from '../../context/pane/PaneContext';
import { duplicateArtifact } from '../../utils/localDb/duplicateArtifact';
import { useHandleTRPCErrors } from '../../utils/useHandleTRPCErrors';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PaneTransition } from '../../context/globalPane/GlobalPaneContext';
import {
  globalTiptapCommandHelpers,
  type GlobalTiptapCommandHelperEntry,
} from './globalTiptapCommandHelpers';
import { useState } from 'react';
import { NewArtifactDialog } from '../artifact/NewArtifactDialog';
import { useEditorState } from '@tiptap/react';
import {
  CreateLinkDialog,
  createLinkDialogDefaultOnSubmit,
} from './tiptap/extensions/artifactBubbleMenu/CreateLinkDialog';

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
  const [insertLinkDialogOpen, setInsertLinkDialogOpen] = useState(false);

  useEditorState({
    editor: props.editor,
    selector: ({ editor }) => {
      return {
        selection: editor.state.selection,

        editUndo: globalTiptapCommandHelpers.edit.undo.enabled(),
        editRedo: globalTiptapCommandHelpers.edit.redo.enabled(),
        editCut: globalTiptapCommandHelpers.edit.cut.enabled(),
        editCopy: globalTiptapCommandHelpers.edit.copy.enabled(),
        editSelectAll: globalTiptapCommandHelpers.edit.selectAll.enabled(),
        editDelete: globalTiptapCommandHelpers.edit.delete.enabled(),
        insertHr: globalTiptapCommandHelpers.insert.hr.enabled(editor),
        insertTable: globalTiptapCommandHelpers.insert.table.enabled(editor),
        insertMonster:
          globalTiptapCommandHelpers.insert.monster.enabled(editor),
        insertWideMonster:
          globalTiptapCommandHelpers.insert.wideMonster.enabled(editor),
        insertSpell: globalTiptapCommandHelpers.insert.spell.enabled(editor),
        insertNote: globalTiptapCommandHelpers.insert.note.enabled(editor),
        insertLink: globalTiptapCommandHelpers.insert.link.enabled(),
        formatTextToggleBold:
          globalTiptapCommandHelpers.format.text.toggleBold.enabled(editor),
        formatTextToggleItalic:
          globalTiptapCommandHelpers.format.text.toggleItalic.enabled(editor),
        formatTextToggleUnderline:
          globalTiptapCommandHelpers.format.text.toggleUnderline.enabled(
            editor,
          ),
        formatTextToggleStrike:
          globalTiptapCommandHelpers.format.text.toggleStrike.enabled(editor),
        formatFontDefault:
          globalTiptapCommandHelpers.format.font.default.enabled(editor),
        formatFontSans:
          globalTiptapCommandHelpers.format.font.sans.enabled(editor),
        formatFontSerif:
          globalTiptapCommandHelpers.format.font.serif.enabled(editor),
        formatFontLibreBaskerville:
          globalTiptapCommandHelpers.format.font.libreBaskerville.enabled(
            editor,
          ),
        formatFontMrEavesRemake:
          globalTiptapCommandHelpers.format.font.mrEavesRemake.enabled(editor),
        formatFontAllison:
          globalTiptapCommandHelpers.format.font.allison.enabled(editor),
        formatFontItalianno:
          globalTiptapCommandHelpers.format.font.italianno.enabled(editor),
        formatFontMonsieurLaDoulaise:
          globalTiptapCommandHelpers.format.font.monsieurLaDoulaise.enabled(
            editor,
          ),
        formatAlignLeft:
          globalTiptapCommandHelpers.format.align.left.enabled(editor),
        formatAlignCenter:
          globalTiptapCommandHelpers.format.align.center.enabled(editor),
        formatAlignRight:
          globalTiptapCommandHelpers.format.align.right.enabled(editor),
        formatParagraph: globalTiptapCommandHelpers.format.paragraph.enabled(),
        formatHeadingH1: globalTiptapCommandHelpers.format.heading.h1.enabled(),
        formatHeadingH2: globalTiptapCommandHelpers.format.heading.h2.enabled(),
        formatHeadingH3: globalTiptapCommandHelpers.format.heading.h3.enabled(),
        formatHeadingH4: globalTiptapCommandHelpers.format.heading.h4.enabled(),
        formatHeadingH5: globalTiptapCommandHelpers.format.heading.h5.enabled(),
        formatHeadingH6: globalTiptapCommandHelpers.format.heading.h6.enabled(),
        formatSinkBlock: globalTiptapCommandHelpers.format.sinkBlock.enabled(),
        formatLiftBlock: globalTiptapCommandHelpers.format.liftBlock.enabled(),
        formatListBulletList:
          globalTiptapCommandHelpers.format.list.bulletList.enabled(editor),
        formatListOrderedList:
          globalTiptapCommandHelpers.format.list.orderedList.enabled(editor),
        formatListTaskList:
          globalTiptapCommandHelpers.format.list.taskList.enabled(editor),
        formatTableInsertColBefore:
          globalTiptapCommandHelpers.format.table.insertColBefore.enabled(
            editor,
          ),
        formatTableInsertColAfter:
          globalTiptapCommandHelpers.format.table.insertColAfter.enabled(
            editor,
          ),
        formatTableDeleteCol:
          globalTiptapCommandHelpers.format.table.deleteCol.enabled(editor),
        formatTableInsertRowAbove:
          globalTiptapCommandHelpers.format.table.insertRowAbove.enabled(
            editor,
          ),
        formatTableInsertRowBelow:
          globalTiptapCommandHelpers.format.table.insertRowBelow.enabled(
            editor,
          ),
        formatTableDeleteRow:
          globalTiptapCommandHelpers.format.table.deleteRow.enabled(editor),
        formatTableToggleHeaderRow:
          globalTiptapCommandHelpers.format.table.toggleHeaderRow.enabled(
            editor,
          ),
        formatTableToggleHeaderCol:
          globalTiptapCommandHelpers.format.table.toggleHeaderCol.enabled(
            editor,
          ),
        formatTableToggleHeaderCell:
          globalTiptapCommandHelpers.format.table.toggleHeaderCell.enabled(
            editor,
          ),
        formatTableDeleteTable:
          globalTiptapCommandHelpers.format.table.deleteTable.enabled(editor),
      };
    },
  });

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
      onClick={() => {
        if (!commandEntry.enabled(props.editor)) return;

        commandEntry.command({
          editor: props.editor,
          range: props.editor.state.selection,
        });
      }}
      disabled={!commandEntry.enabled(props.editor)}
    >
      {commandEntry.icon && <commandEntry.icon />}
      <span style={commandEntry.style}>{t(commandEntry.title)}</span>
    </DropdownMenu.Item>
  );

  const isEditable = [
    CollaborationConnectionAuthorizedScope.CoOwner,
    CollaborationConnectionAuthorizedScope.ReadWrite,
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
        {renderCommandEntryItem({
          ...globalTiptapCommandHelpers.insert.link,
          command: () => {
            setInsertLinkDialogOpen(true);
          },
        })}
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

        <DropdownMenu.Separator />

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger disabled={!props.editor.isActive('table')}>
            <LuTable />
            {t('tiptapControlMenu.format.table')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.insertColBefore,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.insertColAfter,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.deleteCol,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.insertRowAbove,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.insertRowBelow,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.deleteRow,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.toggleHeaderRow,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.toggleHeaderCol,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.toggleHeaderCell,
            )}
            {renderCommandEntryItem(
              globalTiptapCommandHelpers.format.table.deleteTable,
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
      <CreateLinkDialog
        open={insertLinkDialogOpen}
        onOpenChange={setInsertLinkDialogOpen}
        onSubmit={(args) => {
          createLinkDialogDefaultOnSubmit(props.editor, args);
        }}
      />
    </>
  );
};
