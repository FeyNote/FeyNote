import { randomUUID } from 'crypto';
import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

// Example of DocX Bookmark: <p>Bookmark refrence text<span id="sq65enpu61jq" class="anchor"></span></p>
const DOCX_BOOKMARK_CLASS_NAME = 'anchor'

export function updateDocxBookmarks(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
): void {
  const spans = jsdom.window.document.querySelectorAll('span');
  for (const span of spans) {
    const isBookMark = span.className === DOCX_BOOKMARK_CLASS_NAME
    if (!isBookMark) return
    const id = span.id;
    const blockInfo = idToBlockInfo.get(`${artifactId}-${id}`)
    if (!blockInfo) return
    // Must move bookmark to encapsulate the referenced text otherwise it contains nothing and is removed
    const closestValidReferencedParent = span.closest('p,h1,h2,h3,h4,h5,h6')
    if (!closestValidReferencedParent) return
    closestValidReferencedParent.setAttribute('data-id', blockInfo.id);
    span.remove()
  }
}
