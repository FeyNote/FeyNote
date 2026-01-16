import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function updateHeaderDataId(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
): void {
  const headers = jsdom.window.document.querySelectorAll('h1,h2,h3,h4,h5,h6');
  for (const header of headers) {
    const id = header.id;
    if (!id) return;
    const blockInfo = idToBlockInfo.get(`${artifactId}-${id}`);
    if (!blockInfo) return;
    header.setAttribute('data-id', blockInfo.id);
    header.removeAttribute('id');
  }
}
