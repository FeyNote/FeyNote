import {
  ToolName,
  type FeynoteUITool,
  convert5eMonsterToTipTap,
  convert5eObjectToTiptap,
} from '@feynote/shared-utils';
import { starkdown } from 'starkdown';
import { JSONContent } from '@tiptap/core';
import { type UIDataTypes, type UIMessagePart } from 'ai';
import { t } from 'i18next';

export const getEditorContentsFromToolPart = (
  part: UIMessagePart<UIDataTypes, FeynoteUITool>,
  htmlToJson: (html: string) => JSONContent[],
): (string | JSONContent)[] => {
  switch (part.type) {
    case `tool-${ToolName.Generate5eMonster}`: {
      if (!part.input) return [];
      return [convert5eMonsterToTipTap(part.input, t)];
    }
    case `tool-${ToolName.Generate5eObject}`: {
      if (!part.input) return [];
      return [convert5eObjectToTiptap(part.input, htmlToJson)];
    }
    case `tool-${ToolName.ScrapeUrl}`: {
      if (!part.output) return [];
      const editorContents: (string | JSONContent)[] = [];
      part.output.forEach((part) =>
        editorContents.push(...getEditorContentsFromToolPart(part, htmlToJson)),
      );
      return editorContents;
    }
    case 'text': {
      return [starkdown(part.text)];
    }
  }
  return [];
};
