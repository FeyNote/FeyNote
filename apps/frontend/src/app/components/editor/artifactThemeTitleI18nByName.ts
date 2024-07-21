import { ArtifactTheme } from "@feynote/shared-utils";

export const artifactThemeTitleI18nByName = {
  modern: 'artifactTheme.modern',
  fantasy: 'artifactTheme.fantasy',
} as const satisfies Record<ArtifactTheme, string>;
