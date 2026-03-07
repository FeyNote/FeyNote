export interface WorkspaceUpdateQueueItem {
  workspaceId: string;
  userId: string;
  triggeredByUserId: string | undefined;
  oldYBinB64: string;
  newYBinB64: string;
}
