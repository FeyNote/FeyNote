import { TLRecord } from 'tldraw';
import { Array as YArray } from 'yjs';
import { nanoid } from 'nanoid';

/**
 * Randomizes all element UUIDs within some content.
 * This is useful if you're cloning an artifact, since we want
 * content UUIDs to generally be universally unique, though there's no way we can enforce that.
 */
export const randomizeTLDrawContentShapeIds = (
  tldrawContent: YArray<{
    key: string;
    val: TLRecord;
  }>,
): void => {
  for (const entry of tldrawContent) {
    const value = entry.val;
    if (value.typeName === 'shape') {
      const prefix = value.id.split(':')[0];
      if (prefix !== 'shape') {
        // We check the prefix because this is fairly sensitive and we don't want to mess up the IDs.
        // A future TLDraw update could so something funky so lets check to make sure.
        throw new Error(`Unexpected shape ID prefix: ${prefix}`);
      }
      // TLDraw uses nanoid for shape IDs, so we'll do the same here.
      (value.id as unknown) = `${prefix}:${nanoid()}`;
    }
  }
};
