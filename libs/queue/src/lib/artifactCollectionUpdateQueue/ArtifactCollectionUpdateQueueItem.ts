export interface ArtifactCollectionUpdateQueueItem {
  artifactCollectionId: string;
  triggeredByUserId: string | undefined;
  oldYBinB64: string;
  newYBinB64: string;
}
