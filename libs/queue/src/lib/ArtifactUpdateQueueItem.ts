export interface ArtifactUpdateQueueItem {
  artifactId: string;
  userId: string;
  oldYBin: Buffer;
  newYBin: Buffer;
}
