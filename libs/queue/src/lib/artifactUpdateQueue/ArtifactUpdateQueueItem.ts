export interface ArtifactUpdateQueueItem {
  artifactId: string;
  userId: string;
  triggeredByUserId: string | undefined; // We use undefined here to require callers to explicitly pass undefined rather than "forgetting"
  oldYBinB64: string;
  newYBinB64: string;
}
