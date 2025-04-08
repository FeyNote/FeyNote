import TurndownService from 'turndown';
// @ts-expect-error This package does not have any typings
import turndownPluginGfm from 'turndown-plugin-gfm';

export const turndown = (html: string) => {
  const turndownService = new TurndownService();
  const tables = turndownPluginGfm.tables;
  const strikethrough = turndownPluginGfm.strikethrough;
  turndownService.use([tables, strikethrough]);
  const markdown = turndownService.turndown(html);
  return markdown;
};
