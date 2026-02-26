import type { GenerateTableParams } from '../schemas/generateTableSchema';
import type { JSONContent } from '@tiptap/core';
import type { DeepPartial } from 'ai';

export const convertTableToTiptap = (
  generatedTable: DeepPartial<GenerateTableParams>,
): JSONContent[] => {
  const rows: JSONContent[] = [];

  if (generatedTable.headers?.length) {
    rows.push({
      type: 'tableRow',
      content: generatedTable.headers
        .filter((h): h is string => !!h)
        .map((header) => ({
          type: 'tableHeader',
          attrs: { colspan: 1, rowspan: 1, colwidth: null },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: header }],
            },
          ],
        })),
    });
  }

  if (generatedTable.rows?.length) {
    for (const row of generatedTable.rows) {
      if (!row?.length) continue;
      rows.push({
        type: 'tableRow',
        content: row
          .filter((cell): cell is string => !!cell)
          .map((cell) => ({
            type: 'tableCell',
            attrs: { colspan: 1, rowspan: 1, colwidth: null },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: cell }],
              },
            ],
          })),
      });
    }
  }

  return [{ type: 'table', content: rows }];
};
