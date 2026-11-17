import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
  getTiptapServerExtensions,
  sanitizeFilename,
} from '@feynote/shared-utils';
import { generateHTML } from '@tiptap/html';
import { applyUpdate, Doc } from 'yjs';
import { htmlToMarkdown } from '@feynote/api-services';
import type { ArtifactWithReferences } from './artifactReferenceSummary';
import { ExportFormat } from '@feynote/prisma/types';

export interface ArtifactExport {
  sanitizedTitle: string;
  extension: string;
  content: string;
}

export const transformArtifactsToArtifactExports = (
  artifactsWithReferences: ArtifactWithReferences[],
  type: ExportFormat,
  userFileToS3Map: Map<string, string>,
): ArtifactExport[] => {
  const artifactExports = artifactsWithReferences.map((artifactSummary) => {
    const yDoc = new Doc();
    applyUpdate(yDoc, artifactSummary.yBin);
    const tiptap = getTiptapContentFromYjsDoc(yDoc, ARTIFACT_TIPTAP_BODY_KEY);

    const sanitizedTitle = sanitizeFilename(
      getMetaFromYArtifact(yDoc).title,
      artifactSummary.id,
    );

    switch (type) {
      case 'markdown': {
        const extensions = getTiptapServerExtensions({ userFileToS3Map });
        const html = generateHTML(tiptap, extensions);
        let markdown = `${artifactSummary.id}\n`;
        markdown += htmlToMarkdown(html);
        return { sanitizedTitle, extension: 'md', content: markdown };
      }
      case 'json': {
        const content = JSON.stringify(tiptap);
        return { sanitizedTitle, extension: 'json', content };
      }
    }
  });
  return artifactExports;
};
