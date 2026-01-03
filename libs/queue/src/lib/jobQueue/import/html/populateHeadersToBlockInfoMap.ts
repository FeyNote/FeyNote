import { randomUUID } from 'crypto';
import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function populateHeadersToBlockInfoMap(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
): void {
  const headers = jsdom.window.document.querySelectorAll('h1,h2,h3,h4,h5,h6');
  for (const header of headers) {
    const id = header.id;
    const blockId = randomUUID();
    idToBlockInfo.set(`${artifactId}-${id}`, {
      id: blockId,
      artifactId,
      referenceText: header.textContent || '',
    });
  }
}
