import { Doc as YDoc, Array as YArray } from 'yjs';
import { TLYKVRecord } from './TLYKVRecord';
import { TLDRAW_YDOC_STORE_KEY } from '../yjs/artifact/TLDRAW_YDOC_STORE_KEY';

export const getTLDrawContentFromYDoc = (yDoc: YDoc): YArray<TLYKVRecord> => {
  return yDoc.getArray<TLYKVRecord>(TLDRAW_YDOC_STORE_KEY);
};
