import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function updateReferencedAnchors(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
  artifactId: string,
) {
  const aEls = jsdom.window.document.querySelectorAll('a');
  for (const aEl of aEls) {
    const hrefVal = aEl.getAttribute('href');
    if (!hrefVal) return;
    const id = hrefVal.startsWith('#') ? hrefVal.substring(1) : hrefVal;
    const blockInfo = idToBlockInfo.get(`${artifactId}-${id}`);
    const textContent = aEl.textContent;
    const blockEl = jsdom.window.document.createElement('span');
    if (blockInfo) {
      blockEl.setAttribute('data-type', 'artifactReference');
      blockEl.setAttribute('data-artifact-block-id', blockInfo.id);
      blockEl.setAttribute('data-artifact-id', blockInfo.artifactId);
      blockEl.setAttribute(
        'data-artifact-reference-text',
        blockInfo.referenceText,
      );
    }
    blockEl.textContent = textContent;
    aEl.parentNode?.replaceChild(blockEl, aEl);
  }
}
