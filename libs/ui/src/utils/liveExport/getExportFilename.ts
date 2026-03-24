import type { ArtifactType } from '@prisma/client';
import { sanitizeFilename } from './sanitizeFilename';

const artifactTypeToExt = {
  tiptap: 'md',
  tldraw: 'json',
  calendar: 'json',
} satisfies Record<ArtifactType, string>;

export const getExportFilename = (
  title: string,
  artifactId: string,
  type: ArtifactType,
): string => {
  const sanitizedTitle = sanitizeFilename(title);
  const shortId = artifactId.slice(0, 8);
  return `${sanitizedTitle} (${shortId}).${artifactTypeToExt[type]}`;
};
