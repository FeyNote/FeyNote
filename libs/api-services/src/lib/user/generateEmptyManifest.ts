import { Doc, encodeStateAsUpdate } from 'yjs';

export function generateEmptyManifest() {
  const manifest = new Doc();

  return Buffer.from(encodeStateAsUpdate(manifest));
}
