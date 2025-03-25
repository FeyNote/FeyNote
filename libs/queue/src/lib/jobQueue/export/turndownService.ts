import type { ArtifactReferenceSummary } from '@feynote/prisma/types';
import TurndownService from 'turndown';

export const turndown = (html: string, artifactSummary: ArtifactReferenceSummary) => {
  const turndownService = new TurndownService();
  turndownService.addRule('ReplaceReferences', {
    filter: ['span'],
    replacement: function (content, node: any) {
      const referenceArtifactId = node.getAttribute('data-artifact-id')
      const artifactReference = artifactSummary.artifactReferences.find((ref) => ref.targetArtifactId === referenceArtifactId)
      if (!referenceArtifactId || !artifactReference) return content
      const referenceBlock = {
        referenceArtifactId,
        referenceText: artifactReference.referenceText,
      }
      return `[${content}]{${JSON.stringify(referenceBlock)}}`
    }
  })
  const markdown = turndownService.turndown(html)
  return markdown
}
