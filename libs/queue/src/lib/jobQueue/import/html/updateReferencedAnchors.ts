import { type JSDOM } from 'jsdom';
import type { ArtifactBlockInfo } from '../ArtifactBlockInfo';

const BROKEN_REFERENCE_ID = '00000000-0000-0000-0000-000000000000';

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
    blockEl.setAttribute('data-type', 'artifactReference');
    blockEl.setAttribute(
      'data-artifact-block-id',
      blockInfo?.id || BROKEN_REFERENCE_ID,
    );
    blockEl.setAttribute(
      'data-artifact-id',
      blockInfo?.artifactId || BROKEN_REFERENCE_ID,
    );
    blockEl.setAttribute(
      'data-artifact-reference-text',
      blockInfo?.referenceText || 'Broken Reference',
    );
    blockEl.textContent = textContent;
    aEl.parentNode?.replaceChild(blockEl, aEl);
  }
}
