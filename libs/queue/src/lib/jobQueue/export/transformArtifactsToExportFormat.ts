import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { generateHTML } from '@tiptap/html';
import { applyUpdate, Doc } from 'yjs';
import { htmlToMarkdown } from '@feynote/api-services';
import type { ArtifactWithReferences } from './artifactReferenceSummary';
import { ExportFormat } from '@feynote/prisma/types';

export interface ArtifactExport {
  title: string;
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

    let title = getMetaFromYArtifact(yDoc).title;
    title += type === 'markdown' ? '.md' : '.json';

    switch (type) {
      case 'markdown': {
        const extensions = getTiptapServerExtensions({ userFileToS3Map });
        const html = generateHTML(tiptap, extensions);
        let markdown = `${artifactSummary.id}\n`;
        markdown += htmlToMarkdown(html);
        return { title, content: markdown };
      }
      case 'json': {
        const content = JSON.stringify(tiptap);
        return { title, content };
      }
    }
  });
  return artifactExports;
};
