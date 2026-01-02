import { randomUUID } from 'crypto';
import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function updateIdsOnHeaders(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
): string {
  const headers = jsdom.window.document.querySelectorAll('h1,h2,h3,h4,h5,h6');
  for (const header of headers) {
    const id = header.id;
    const blockId = randomUUID();
    idToBlockInfo.set(id, {
      id: blockId,
      artifactId,
      referenceText: header.textContent || '',
    });
    header.setAttribute('data-id', blockId);
    header.removeAttribute('id');
  }

  return jsdom.window.document.documentElement.outerHTML;
}
