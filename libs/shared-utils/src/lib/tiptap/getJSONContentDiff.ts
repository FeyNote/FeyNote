import { getTextForJSONContent } from './getTextForJSONContent';
import { JSONContent } from '@tiptap/core';
import { getJSONContentMapById } from './getJSONContentMapById';
import { getIdForJSONContentUnsafe } from './getIdForJSONContentUnsafe';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSONContentDiff {
  export type Added = {
    id: string;
    status: 'added';
    oldText: undefined;
    newText: string;
    oldJSONContent: undefined;
    newJSONContent: JSONContent;
    referenceText: string;
  };
  export type Deleted = {
    id: string;
    status: 'deleted';
    oldText: string;
    newText: undefined;
    oldJSONContent: JSONContent;
    newJSONContent: undefined;
    referenceText: string;
  };
  export type Updated = {
    id: string;
    status: 'updated';
    oldText: string;
    newText: string;
    oldJSONContent: JSONContent;
    newJSONContent: JSONContent;
    referenceText: string;
  };

  export type ResultEntry = Added | Deleted | Updated;

  export type Result = Map<string, ResultEntry>;
}

export function getJSONContentDiff(
  _oldJSONContent: JSONContent,
  _newJSONContent: JSONContent,
): JSONContentDiff.Result {
  const oldJSONContentById = getJSONContentMapById(_oldJSONContent);
  const newJSONContentById = getJSONContentMapById(_newJSONContent);

  // Fetch flat list of blocks, rather than tree which is what this function is called with
  const oldJSONContents = [...oldJSONContentById.values()];
  const newJSONContents = [...newJSONContentById.values()];

  const results: JSONContentDiff.Result = new Map();

  for (const newEl of newJSONContents) {
    const oldEl = oldJSONContentById.get(getIdForJSONContentUnsafe(newEl));
    if (oldEl) {
      const oldText = getTextForJSONContent(oldEl);
      const newText = getTextForJSONContent(newEl);

      if (oldText !== newText) {
        results.set(getIdForJSONContentUnsafe(newEl), {
          id: getIdForJSONContentUnsafe(newEl),
          status: 'updated',
          oldText,
          newText,
          oldJSONContent: oldEl,
          newJSONContent: newEl,
          referenceText: newText,
        });
      }
    } else {
      const newText = getTextForJSONContent(newEl);

      results.set(getIdForJSONContentUnsafe(newEl), {
        id: getIdForJSONContentUnsafe(newEl),
        status: 'added',
        oldText: undefined,
        newText,
        oldJSONContent: undefined,
        newJSONContent: newEl,
        referenceText: newText,
      });
    }
  }

  for (const oldEl of oldJSONContents) {
    const newEl = newJSONContentById.get(getIdForJSONContentUnsafe(oldEl));
    if (!newEl) {
      const oldText = getTextForJSONContent(oldEl);

      results.set(getIdForJSONContentUnsafe(oldEl), {
        id: getIdForJSONContentUnsafe(oldEl),
        status: 'deleted',
        oldText,
        newText: undefined,
        oldJSONContent: oldEl,
        newJSONContent: undefined,
        referenceText: oldText,
      });
    }
  }

  return results;
}
