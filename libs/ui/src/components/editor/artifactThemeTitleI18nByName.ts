import type { ArtifactTheme } from '@prisma/client';

export const artifactThemeTitleI18nByName = {
  default: 'artifactTheme.default',
  classic: 'artifactTheme.classic',
} as const satisfies Record<ArtifactTheme, string>;
