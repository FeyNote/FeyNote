import type { ArtifactTheme } from '@prisma/client';

// export const ArtifactTheme = {
//   default: "default",
//   classic: "classic",
// } as const;
//
export const artifactThemeTitleI18nByName = {
  default: 'artifactTheme.default',
  classic: 'artifactTheme.classic',
} as const satisfies Record<ArtifactTheme, string>;
