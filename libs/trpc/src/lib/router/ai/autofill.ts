import { z } from 'zod';
import { generateObject } from 'ai';
import { generateJSON } from '@tiptap/html';
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
} from '@feynote/shared-utils';
import { globalServerConfig } from '@feynote/config';
import type { JSONContent } from '@tiptap/core';

export const autofill = authenticatedProcedure
  .input(
    z.object({
      source: z.discriminatedUnion('type', [
        z.object({
          type: z.literal('text'),
          text: z.string().min(1).max(10000),
        }),
        z.object({ type: z.literal('url'), url: z.url() }),
      ]),
      outputFormat: z.enum([
        'statblock',
        'widestatblock',
        'spellsheet',
        'table',
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
      model = globalServerConfig.ai.model.chatLow;
    } else {
      const res = await proxyGetRequest(input.source.url);
      content = convertHtmlToPlainText(res.data);
      model = globalServerConfig.ai.model.scrapeUrl;
    }

    if (input.instructions) {
      content += '\n\nAdditional instructions: ' + input.instructions;
    }

    switch (input.outputFormat) {
      case 'statblock':
      case 'widestatblock': {
        const result = await generateObject({
          model: aiProvider(model),
          maxOutputTokens: 16383,
          messages: [systemMessage.scrapeContent, { role: 'user', content }],
          schema: getGenerate5eMonsterSchema(),
        });

        return convert5eMonsterToTipTap(
          result.object,
          translateSync,
          input.outputFormat === 'widestatblock',
        );
      }

      case 'spellsheet': {
        const result = await generateObject({
          model: aiProvider(model),
          maxOutputTokens: 16383,
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
          maxOutputTokens: 16383,
          messages: [systemMessage.scrapeContent, { role: 'user', content }],
          schema: getGenerateTableSchema(),
        });

        return convertTableToTiptap(result.object);
      }
    }
  });
