import { ArtifactType } from "../types/ArtifactType";
import { ArtifactTheme } from "../types/themes";

export interface YArtifactMetaSchema {
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
}
