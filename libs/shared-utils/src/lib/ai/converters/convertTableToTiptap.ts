import type { GenerateTableParams } from '../schemas/generateTableSchema';
import type { JSONContent } from '@tiptap/core';
import type { DeepPartial } from 'ai';

export const convertTableToTiptap = (
  generatedTable: DeepPartial<GenerateTableParams>,
): JSONContent[] => {
  const rows: JSONContent[] = [];
  let columnCount = 0;

  if (generatedTable.headers?.length) {
    const headerCells = generatedTable.headers
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
      }));
    columnCount = headerCells.length;
    rows.push({ type: 'tableRow', content: headerCells });
  }

  if (generatedTable.rows?.length) {
    for (const row of generatedTable.rows) {
      if (!row?.length) continue;
      const cells = row
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
        }));
      while (cells.length < columnCount) {
        cells.push({
          type: 'tableCell',
          attrs: { colspan: 1, rowspan: 1, colwidth: null },
          content: [{ type: 'paragraph', content: [] }],
        });
      }
      rows.push({ type: 'tableRow', content: cells });
    }
  }

  return [{ type: 'table', content: rows }];
};
