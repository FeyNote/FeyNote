import { getTextForJSONContent } from './getTextForJSONContent';
import { JSONContent } from '@tiptap/core';
import { getJSONContentMapById } from './getJSONContentMapById';
import { getIdForJSONContent } from './getIdForJSONContent';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSONContentDiff {
  export type Added = {
    id: string;
    status: 'added';
    oldJSONContent: undefined;
    newJSONContent: JSONContent;
    referenceText: string;
  };
  export type Deleted = {
    id: string;
    status: 'deleted';
    oldJSONContent: JSONContent;
    newJSONContent: undefined;
    referenceText: string;
  };
  export type Updated = {
    id: string;
    status: 'updated';
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
  const oldJSONContents = Object.values(oldJSONContentById);
  const newJSONContents = Object.values(newJSONContentById);

  const results: JSONContentDiff.Result = new Map();

  for (const newEl of newJSONContents) {
    const oldEl = oldJSONContentById.get(getIdForJSONContent(newEl));
    if (oldEl) {
      const oldText = getTextForJSONContent(oldEl);
      const newText = getTextForJSONContent(newEl);

      if (oldText !== newText) {
        results.set(getIdForJSONContent(newEl), {
          id: getIdForJSONContent(newEl),
          status: 'updated',
          oldJSONContent: oldEl,
          newJSONContent: newEl,
          referenceText: newText,
        });
      }
    } else {
      const newText = getTextForJSONContent(newEl);

      results.set(getIdForJSONContent(newEl), {
        id: getIdForJSONContent(newEl),
        status: 'added',
        oldJSONContent: undefined,
        newJSONContent: newEl,
        referenceText: newText,
      });
    }
  }

  for (const oldEl of oldJSONContents) {
    const newEl = newJSONContentById.get(getIdForJSONContent(oldEl));
    if (!newEl) {
      const oldText = getTextForJSONContent(oldEl);

      results.set(getIdForJSONContent(oldEl), {
        id: getIdForJSONContent(oldEl),
        status: 'deleted',
        oldJSONContent: oldEl,
        newJSONContent: undefined,
        referenceText: oldText,
      });
    }
  }

  return results;
}
