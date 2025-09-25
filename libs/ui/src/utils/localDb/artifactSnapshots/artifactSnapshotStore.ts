import type { ArtifactSnapshot } from '@feynote/global-types';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@feynote/trpc';
import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';
import { trpc } from '../../trpc';

/**
 * Please do not interact with this class directly from React if avoidable.
 * Use our many custom use* hooks instead.
 */
class ArtifactSnapshotStore {
  /**
   * Pseudo-react context like, that keeps track of what listeners are interested in what artifacts
   */
  private listenersForSpecificArtifactId: Record<string, Set<() => void>> = {};
  private listenersForAnyUpdate = new Set<() => void>();
  private listenersForFetchFailure = new Set<(e: unknown) => void>();

  /**
   * Helps us invalidate in-flight requests when a session changes
   */
  private sessionInvalidationRandom = crypto.randomUUID();
  /**
   * Helps us invalidate in-flight requests when a new event comes in
   */
  private loadAllArtifactSnapshotsRandom = crypto.randomUUID();
  private loadArtifactSnapshotRandomByArtifactId = new Map<string, string>();

  private artifactSnapshotsById = new Map<string, ArtifactSnapshot>();
  private artifactSnapshots: ArtifactSnapshot[] = [];

  private _isLoading = true;
  // Readonly to external consumers.
  public get isLoading() {
    return this._isLoading;
  }

  constructor() {
    eventManager.addEventListener(EventName.LocaldbSessionUpdated, async () => {
      this.artifactSnapshotsById.clear();
      this.sessionInvalidationRandom = crypto.randomUUID();
      this._isLoading = true;
      this.notify();

      this.loadAllArtifactSnapshots().then(() => {
        this._isLoading = false;
        this.notify();
      });
    });
    eventManager.addEventListener(
      EventName.LocaldbArtifactSnapshotUpdated,
      async (_, data) => {
        await this.loadArtifactSnapshot(data.artifactId);
        this.notify([data.artifactId]);
      },
    );
    eventManager.addEventListener(
      EventName.ArtifactUpdated,
      async (_, data) => {
        await this.loadArtifactSnapshot(data.artifactId);
        this.notify([data.artifactId]);
      },
    );

    this.loadAllArtifactSnapshots().then(() => {
      this._isLoading = false;
      this.notify();
    });

    // For contextless use within React
    this.getArtifactSnapshotById = this.getArtifactSnapshotById.bind(this);
    this.listen = this.listen.bind(this);
    this.listenForArtifactId = this.listenForArtifactId.bind(this);
    this.listenForFetchFailure = this.listenForFetchFailure.bind(this);
  }

  public getArtifactSnapshots(): ReadonlyArray<ArtifactSnapshot> {
    return this.artifactSnapshots;
  }

  public getArtifactSnapshotsById(): ReadonlyMap<string, ArtifactSnapshot> {
    return this.artifactSnapshotsById;
  }

  public getArtifactSnapshotById(id: string): ArtifactSnapshot | undefined {
    return this.artifactSnapshotsById.get(id);
  }

  public listen(listener: () => void) {
    this.listenersForAnyUpdate.add(listener);

    return () => {
      this.listenersForAnyUpdate.delete(listener);
    };
  }

  public listenForFetchFailure(listener: (e: unknown) => void) {
    this.listenersForFetchFailure.add(listener);

    return () => {
      this.listenersForFetchFailure.delete(listener);
    };
  }

  public listenForArtifactId(artifactId: string, listener: () => void) {
    this.listenersForSpecificArtifactId[artifactId] ||= new Set();
    this.listenersForSpecificArtifactId[artifactId].add(listener);

    return () => {
      this.listenersForSpecificArtifactId[artifactId].delete(listener);
      if (this.listenersForSpecificArtifactId[artifactId].size === 0) {
        delete this.listenersForSpecificArtifactId[artifactId];
      }
    };
  }

  private async loadAllArtifactSnapshots() {
    const inflightRandomBefore = (this.loadAllArtifactSnapshotsRandom =
      crypto.randomUUID());
    const sessionRandomBefore = this.sessionInvalidationRandom;
    const result = await trpc.artifact.getArtifactSnapshots
      .query()
      .catch((e) => {
        this.notifyFetchError(e);
      });
    if (!result) return;
    if (inflightRandomBefore !== this.loadAllArtifactSnapshotsRandom) return;
    if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

    this.artifactSnapshotsById = new Map(result.map((el) => [el.id, el]));
    this.artifactSnapshots = result;
  }

  private async loadArtifactSnapshot(artifactId: string) {
    const inflightRandomBefore = crypto.randomUUID();
    this.loadArtifactSnapshotRandomByArtifactId.set(
      artifactId,
      inflightRandomBefore,
    );
    const sessionRandomBefore = this.sessionInvalidationRandom;
    const response = await trpc.artifact.getArtifactSnapshotById
      .query({ id: artifactId })
      .catch((e) => {
        if (
          inflightRandomBefore !==
          this.loadArtifactSnapshotRandomByArtifactId.get(artifactId)
        )
          return;
        if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

        if (e instanceof TRPCClientError) {
          const status = (e as TRPCClientError<AppRouter>).data?.httpStatus;

          if (status === 404) {
            this.artifactSnapshotsById.delete(artifactId);
            this.artifactSnapshots = Array.from(
              this.artifactSnapshotsById.values(),
            );
            this.notify([artifactId]);

            return;
          }
        }
        this.notifyFetchError(e);
      });

    if (!response) return;
    if (
      inflightRandomBefore !==
      this.loadArtifactSnapshotRandomByArtifactId.get(artifactId)
    )
      return;
    if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

    this.artifactSnapshotsById.set(artifactId, response);
    this.artifactSnapshots = Array.from(this.artifactSnapshotsById.values());
  }

  /**
   * Notifies all of the listeners stored on this class.
   * If artifactIds argument is omitted, notifies all listeners.
   */
  private notify(artifactIds?: string[]) {
    let _artifactIds = artifactIds;
    if (!_artifactIds) {
      _artifactIds = Object.keys(this.listenersForSpecificArtifactId);
    }

    for (const artifactId of _artifactIds) {
      const listeners = this.listenersForSpecificArtifactId[artifactId];
      if (!listeners) {
        continue;
      }

      for (const listener of listeners) {
        listener();
      }
    }
    for (const listener of this.listenersForAnyUpdate) {
      listener();
    }
  }

  private notifyFetchError(e: unknown) {
    for (const listener of this.listenersForFetchFailure) {
      listener(e);
    }
  }
}

let artifactSnapshotStore: ArtifactSnapshotStore | null = null;
export const getArtifactSnapshotStore = () => {
  if (!artifactSnapshotStore) {
    artifactSnapshotStore = new ArtifactSnapshotStore();
  }

  return artifactSnapshotStore;
};
