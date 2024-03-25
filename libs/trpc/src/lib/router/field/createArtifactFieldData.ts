import {
  ArtifactFieldData,
  ArtifactFieldDataKey,
  ArtifactFieldInputType,
} from './types';

const artifactFieldData: ArtifactFieldDataKey[] = [
  'text',
  'title',
  'order',
  'aiPrompt',
  'description',
  'placeholder',
  'required',
  'type',
] as const;

export const createArtifactFieldData = (
  artifactFieldInput: ArtifactFieldInputType
  // eslint-disable-next-line @typescript-eslint/ban-types
): ArtifactFieldData | {} => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  let artifactFieldData: ArtifactFieldData | {} = {};
  for (const key in artifactFieldInput) {
    if (isDataKey(key)) {
      const value = artifactFieldInput[key];
      if (value !== undefined) {
        artifactFieldData = {
          ...artifactFieldData,
          key: value,
        };
      }
    }
  }

  return artifactFieldData;
};

const isDataKey = (key: string): key is ArtifactFieldDataKey => {
  return key in artifactFieldData;
};
