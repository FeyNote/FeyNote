const getTableObj = (value: string, type: 'tableCell' | 'tableHeader') => {
  return {
    type,
    attrs: { colspan: 1, rowspan: 1, colwidth: null },
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: value,
          },
        ],
      },
    ],
  };
};

export const generateTableDataFromObjectKeys = (
  obj: Record<string, string>,
) => {
  const validKeys = Object.keys(obj).filter((key) => !!obj[key].trim());
  if (!validKeys.length) return [];
  const rowHeaderContent = validKeys.map((key) => {
    return getTableObj(key.toUpperCase(), 'tableHeader');
  });
  const rowValueContent = validKeys.map((key) => {
    return getTableObj(obj[key], 'tableCell');
  });
  return [
    { type: 'horizontalRule' },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: rowHeaderContent,
        },
        {
          type: 'tableRow',
          content: rowValueContent,
        },
      ],
    },
  ];
};
