import {
  ExportJobType,
  type ArtifactReferenceSummary,
} from '@feynote/prisma/types';
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getMetaFromYArtifact,
  getTiptapContentFromYjsDoc,
  getTiptapServerExtensions,
} from '@feynote/shared-utils';
import { generateHTML } from '@tiptap/html';
import { applyUpdate, Doc } from 'yjs';
import { turndown } from './turndownService';

export interface ArtifactExport {
  title: string;
  content: string;
}

export const transformArtifactsToArtifactExports = (
  artifactSummaries: ArtifactReferenceSummary[],
  type: ExportJobType,
  userFileToS3Map: Map<string, string>,
): ArtifactExport[] => {
  const artifactExports = artifactSummaries.map((artifactSummary) => {
    const yDoc = new Doc();
    applyUpdate(yDoc, artifactSummary.yBin);
    const tiptap = getTiptapContentFromYjsDoc(yDoc, ARTIFACT_TIPTAP_BODY_KEY);

    let title = getMetaFromYArtifact(yDoc).title;
    title += type === ExportJobType.Markdown ? '.md' : '.json';

    switch (type) {
      case ExportJobType.Markdown: {
        const extensions = getTiptapServerExtensions({ userFileToS3Map });
        const html = generateHTML(tiptap, extensions);
        let markdown = `${artifactSummary.id}\n`;
        markdown += turndown(html);
        return { title, content: markdown };
      }
      case ExportJobType.Json: {
        const content = JSON.stringify(tiptap);
        return { title, content };
      }
    }
  });
  return artifactExports;
};
