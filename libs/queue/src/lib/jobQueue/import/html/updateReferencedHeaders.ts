import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

export function updateReferencedHeaders(
  jsdom: JSDOM,
  idToBlockInfo: Map<string, ArtifactBlockInfo>,
) {
  const aEls = jsdom.window.document.querySelectorAll('a');
  for (const aEl of aEls) {
    const hrefVal = aEl.getAttribute('href');
    if (!hrefVal || !hrefVal.startsWith('#')) return;
    const blockInfo = idToBlockInfo.get(hrefVal.substring(1));
    if (!blockInfo) return;
    const textContent = aEl.textContent;
    const blockEl = jsdom.window.document.createElement('span');
    blockEl.setAttribute('data-type', 'artifactReference');
    blockEl.setAttribute('data-artifact-block-id', blockInfo.id);
    blockEl.setAttribute('data-artifact-id', blockInfo.artifactId);
    blockEl.setAttribute(
      'data-artifact-reference-text',
      blockInfo.referenceText,
    );
    blockEl.textContent = textContent;
    aEl.parentNode?.replaceChild(blockEl, aEl);
  }
}
