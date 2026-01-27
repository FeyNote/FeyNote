import { randomUUID } from 'crypto';
import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function populateBookmarksToBlockInfoMap(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
): void {
  // Example of DocX Bookmark: <p>Bookmark refrence text<span id="sq65enpu61jq" class="anchor"></span></p>
  const spans = jsdom.window.document.querySelectorAll('span.anchor');
  for (const span of spans) {
    const id = span.id;
    if (!id) return;
    const blockId = randomUUID();
    // Must move bookmark to encapsulate the referenced text otherwise it contains nothing and is removed
    const closestValidReferencedParent = span.closest('p,h1,h2,h3,h4,h5,h6');
    const referenceText = closestValidReferencedParent?.textContent || '###'; //TODO: Should update this to bookmark once serverside translations are done
    idToBlockInfo.set(`${artifactId}-${id}`, {
      id: blockId,
      artifactId,
      referenceText,
    });
  }
}
