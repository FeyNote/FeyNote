import TurndownService from 'turndown';
// @ts-expect-error This package does not have any typings
import { tables, strikethrough } from 'turndown-plugin-gfm';

const turndownService = new TurndownService();
turndownService.use([tables, strikethrough]);

export const htmlToMarkdown = (html: string): string => {
  return turndownService.turndown(html);
};
