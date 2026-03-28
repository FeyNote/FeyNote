import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { generateJSON } from '@tiptap/html';
import { Markdown, MarkdownManager } from '@tiptap/markdown';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import {
  aiProvider,
  systemMessage,
  convertHtmlToPlainText,
  proxyGetRequest,
  translateSync,
} from '@feynote/api-services';
import {
  getGenerate5eMonsterSchema,
  convert5eMonsterToTipTap,
  getGenerate5eObjectSchema,
  convert5eObjectToTiptap,
  getGenerateTableSchema,
  convertTableToTiptap,
  getTiptapServerExtensions,
  addMissingBlockIds,
} from '@feynote/shared-utils';
import { globalServerConfig } from '@feynote/config';
import type { JSONContent } from '@tiptap/core';

export const autofillToTiptapJSON = authenticatedProcedure
  .input(
    z.object({
      source: z.discriminatedUnion('type', [
        z.object({
          type: z.literal('text'),
          text: z.string().min(1).max(10000),
        }),
        z.object({ type: z.literal('url'), url: z.url() }),
      ]),
      mode: z.enum([
        'statblock',
        'widestatblock',
        'spellsheet',
        'table',
        'richText',
      ]),
      instructions: z.string().max(500).optional(),
    }),
  )
  .mutation(async ({ input }): Promise<JSONContent[]> => {
    const extensions = getTiptapServerExtensions({});

    let content: string;
    let model: string;

    if (input.source.type === 'text') {
      content = input.source.text;
      model = globalServerConfig.ai.model.autoformat;
    } else {
      const res = await proxyGetRequest(input.source.url);
      content = convertHtmlToPlainText(res.data).slice(0, 50000);
      model = globalServerConfig.ai.model.scrapeUrl;
    }

    if (input.instructions) {
      content += '\n\nAdditional instructions: ' + input.instructions;
    }

    switch (input.mode) {
      case 'statblock':
      case 'widestatblock': {
        const result = await generateObject({
          model: aiProvider(model),
          messages: [systemMessage.scrapeContent, { role: 'user', content }],
          schema: getGenerate5eMonsterSchema(),
        });

        return convert5eMonsterToTipTap(
          result.object,
          translateSync,
          input.mode === 'widestatblock',
        );
      }

      case 'spellsheet': {
        const result = await generateObject({
          model: aiProvider(model),
          messages: [systemMessage.scrapeContent, { role: 'user', content }],
          schema: getGenerate5eObjectSchema(),
        });

        return convert5eObjectToTiptap(
          result.object,
          (html) => generateJSON(html, extensions)['content'],
        );
      }

      case 'table': {
        const result = await generateObject({
          model: aiProvider(model),
          messages: [systemMessage.scrapeContent, { role: 'user', content }],
          schema: getGenerateTableSchema(),
        });

        return convertTableToTiptap(result.object);
      }

      case 'richText': {
        const result = await generateText({
          model: aiProvider(model),
          messages: [systemMessage.autoFormatText, { role: 'user', content }],
        });

        const markdownManager = new MarkdownManager({
          extensions: [...extensions, Markdown],
        });
        const tiptap = markdownManager.parse(result.text);
        addMissingBlockIds(tiptap);
        return tiptap['content'] ?? [];
      }
    }
  });
