import {
  ToolName,
} from '@feynote/shared-utils';
import { starkdown } from 'starkdown';
import { JSONContent } from '@tiptap/core';
import { type Tool, type UIDataTypes, type UIMessagePart } from 'ai';
import { t } from 'i18next';
import type { FeynoteUITool } from '../../components/assistant/FeynoteUIMessage';
import { convert5eMonsterToTipTap } from '../ai/converters/convert5eMonsterToTipTap';
import { convert5eObjectToTiptap } from '../ai/converters/convert5eObjectToTiptap';

export const getEditorContentsFromToolPart = (
  part: UIMessagePart<UIDataTypes, FeynoteUITool>,
): (string | JSONContent)[] => {
  switch(part.type) {
    case `tool-${ToolName.Display5eMonster}`: {
      if (!part.input) return []
      const tiptapContent = convert5eMonsterToTipTap(part.input, t);
      if (!tiptapContent) return []
      return [tiptapContent];
    }
    case `tool-${ToolName.Display5eObject}`: {
      if (!part.input) return []
      const tiptapContent = convert5eObjectToTiptap(part.input);
      if (!tiptapContent) return []
      return [tiptapContent];
    }
    case `tool-${ToolName.DisplayUrl}`:
      const editorContents: (string | JSONContent)[] = [];
      if (part.output?.text) {
        editorContents.push(starkdown(part.output.text));
      }
      if (part.output?.toolInvocations) {
        part.output.toolInvocations.forEach((invocation: Tool) =>
          editorContents.push(...getEditorContentsFromToolPart(invocation)),
        );
      }
      return editorContents;
    }
  return [];
};
