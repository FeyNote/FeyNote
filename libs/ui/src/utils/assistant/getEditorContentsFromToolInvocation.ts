import { ToolName, type FeynoteUITool } from '@feynote/shared-utils';
import { starkdown } from 'starkdown';
import { JSONContent } from '@tiptap/core';
import { type UIDataTypes, type UIMessagePart } from 'ai';
import { convert5eMonsterToTipTap } from '../ai/converters/convert5eMonsterToTipTap';
import { convert5eObjectToTiptap } from '../ai/converters/convert5eObjectToTiptap';

export const getEditorContentsFromToolPart = (
  part: UIMessagePart<UIDataTypes, FeynoteUITool>,
): (string | JSONContent)[] => {
  switch (part.type) {
    case `tool-${ToolName.Generate5eMonster}`: {
      if (!part.input) return [];
      const tiptapContent = convert5eMonsterToTipTap(part.input);
      if (!tiptapContent) return [];
      return [tiptapContent];
    }
    case `tool-${ToolName.Generate5eObject}`: {
      if (!part.input) return [];
      const tiptapContent = convert5eObjectToTiptap(part.input);
      if (!tiptapContent) return [];
      return [tiptapContent];
    }
    case `tool-${ToolName.ScrapeUrl}`: {
      if (!part.output) return [];
      const editorContents: (string | JSONContent)[] = [];
      part.output.forEach((part) =>
        editorContents.push(...getEditorContentsFromToolPart(part)),
      );
      return editorContents;
    }
    case 'text': {
      return [starkdown(part.text)];
    }
  }
  return [];
};
