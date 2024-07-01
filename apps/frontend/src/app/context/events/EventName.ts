export enum EventName {
  /**
   * Fired after an artifact is created
   */
  ArtifactCreated = 'artifact.created',
  /**
   * Fired after an artifact is pinned or unpinned
   */
  ArtifactPinned = 'artifact.pinned',
  /**
   * Fired after an artifact's title has been changed
   */
  ArtifactTitleUpdated = 'artifact.titleUpdated',
}
