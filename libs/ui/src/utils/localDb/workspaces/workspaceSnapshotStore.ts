import type { WorkspaceSnapshot } from '@feynote/global-types';
import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '@feynote/trpc';
import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';
import { getWorkspaceSnapshotsAction } from '../../../actions/getWorkspaceSnapshotsAction';
import { getWorkspaceSnapshotByIdAction } from '../../../actions/getWorkspaceSnapshotByIdAction';

class WorkspaceSnapshotStore {
  private listenersForSpecificWorkspaceId: Record<string, Set<() => void>> = {};
  private listenersForAnyUpdate = new Set<() => void>();
  private listenersForFetchFailure = new Set<(e: unknown) => void>();

  private sessionInvalidationRandom = crypto.randomUUID();
  private loadAllWorkspaceSnapshotsRandom = crypto.randomUUID();
  private loadWorkspaceSnapshotRandomByWorkspaceId = new Map<string, string>();

  private workspaceSnapshotsById = new Map<string, WorkspaceSnapshot>();
  private workspaceSnapshots: WorkspaceSnapshot[] = [];
  private workspaceSnapshotsByArtifactId = new Map<
    string,
    WorkspaceSnapshot[]
  >();
  private workspaceSnapshotsByThreadId = new Map<string, WorkspaceSnapshot[]>();

  private _isLoading = true;
  public get isLoading() {
    return this._isLoading;
  }

  constructor() {
    eventManager.addEventListener(EventName.LocaldbSessionUpdated, async () => {
      this.workspaceSnapshotsById.clear();
      this.workspaceSnapshotsByArtifactId.clear();
      this.workspaceSnapshotsByThreadId.clear();
      this.sessionInvalidationRandom = crypto.randomUUID();
      this._isLoading = true;
      this.notify();

      this.loadAllWorkspaceSnapshots().then(() => {
        this._isLoading = false;
        this.notify();
      });
    });
    eventManager.addEventListener(
      EventName.LocaldbWorkspaceSnapshotUpdated,
      async (data) => {
        await this.loadWorkspaceSnapshot(data.workspaceId);
        this.notify([data.workspaceId]);
      },
    );
    eventManager.addEventListener(EventName.WorkspaceUpdated, async (data) => {
      await this.loadWorkspaceSnapshot(data.workspaceId);
      this.notify([data.workspaceId]);
    });

    this.loadAllWorkspaceSnapshots().then(() => {
      this._isLoading = false;
      this.notify();
    });
  }

  public getWorkspaceSnapshots(): ReadonlyArray<WorkspaceSnapshot> {
    return this.workspaceSnapshots;
  }

  public getWorkspaceSnapshotsById(): ReadonlyMap<string, WorkspaceSnapshot> {
    return this.workspaceSnapshotsById;
  }

  public getWorkspaceSnapshotById(id: string): WorkspaceSnapshot | undefined {
    return this.workspaceSnapshotsById.get(id);
  }

  public getWorkspaceSnapshotsForArtifactId(
    artifactId: string,
  ): ReadonlyArray<WorkspaceSnapshot> {
    return this.workspaceSnapshotsByArtifactId.get(artifactId) ?? [];
  }

  public getWorkspaceSnapshotsForThreadId(
    threadId: string,
  ): ReadonlyArray<WorkspaceSnapshot> {
    return this.workspaceSnapshotsByThreadId.get(threadId) ?? [];
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

  public listenForWorkspaceId(workspaceId: string, listener: () => void) {
    this.listenersForSpecificWorkspaceId[workspaceId] ||= new Set();
    this.listenersForSpecificWorkspaceId[workspaceId].add(listener);

    return () => {
      this.listenersForSpecificWorkspaceId[workspaceId]?.delete(listener);
      if (this.listenersForSpecificWorkspaceId[workspaceId]?.size === 0) {
        delete this.listenersForSpecificWorkspaceId[workspaceId];
      }
    };
  }

  private rebuildIndexes() {
    this.workspaceSnapshotsByArtifactId.clear();
    this.workspaceSnapshotsByThreadId.clear();
    for (const snapshot of this.workspaceSnapshots) {
      if (snapshot.meta.deletedAt) continue;
      for (const artifactId of snapshot.artifactIds) {
        let list = this.workspaceSnapshotsByArtifactId.get(artifactId);
        if (!list) {
          list = [];
          this.workspaceSnapshotsByArtifactId.set(artifactId, list);
        }
        list.push(snapshot);
      }
      for (const threadId of snapshot.threadIds) {
        let list = this.workspaceSnapshotsByThreadId.get(threadId);
        if (!list) {
          list = [];
          this.workspaceSnapshotsByThreadId.set(threadId, list);
        }
        list.push(snapshot);
      }
    }
  }

  private async loadAllWorkspaceSnapshots() {
    const inflightRandomBefore = (this.loadAllWorkspaceSnapshotsRandom =
      crypto.randomUUID());
    const sessionRandomBefore = this.sessionInvalidationRandom;
    const result = await getWorkspaceSnapshotsAction().catch((e) => {
      this.notifyFetchError(e);
    });
    if (!result) return;
    if (inflightRandomBefore !== this.loadAllWorkspaceSnapshotsRandom) return;
    if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

    this.workspaceSnapshotsById = new Map(result.map((el) => [el.id, el]));
    this.workspaceSnapshots = result;
    this.rebuildIndexes();
  }

  private async loadWorkspaceSnapshot(workspaceId: string) {
    const inflightRandomBefore = crypto.randomUUID();
    this.loadWorkspaceSnapshotRandomByWorkspaceId.set(
      workspaceId,
      inflightRandomBefore,
    );
    const sessionRandomBefore = this.sessionInvalidationRandom;
    const response = await getWorkspaceSnapshotByIdAction({
      id: workspaceId,
    }).catch((e) => {
      if (
        inflightRandomBefore !==
        this.loadWorkspaceSnapshotRandomByWorkspaceId.get(workspaceId)
      )
        return;
      if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

      if (e instanceof TRPCClientError) {
        const status = (e as TRPCClientError<AppRouter>).data?.httpStatus;

        if (status === 404) {
          this.workspaceSnapshotsById.delete(workspaceId);
          this.workspaceSnapshots = Array.from(
            this.workspaceSnapshotsById.values(),
          );
          this.rebuildIndexes();
          this.notify([workspaceId]);

          return;
        }
      }
      this.notifyFetchError(e);
    });

    if (!response) return;
    if (
      inflightRandomBefore !==
      this.loadWorkspaceSnapshotRandomByWorkspaceId.get(workspaceId)
    )
      return;
    if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

    this.workspaceSnapshotsById.set(workspaceId, response);
    this.workspaceSnapshots = Array.from(this.workspaceSnapshotsById.values());
    this.rebuildIndexes();
  }

  private notify(workspaceIds?: string[]) {
    let _workspaceIds = workspaceIds;
    if (!_workspaceIds) {
      _workspaceIds = Object.keys(this.listenersForSpecificWorkspaceId);
    }

    for (const workspaceId of _workspaceIds) {
      const listeners = this.listenersForSpecificWorkspaceId[workspaceId];
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

let workspaceSnapshotStore: WorkspaceSnapshotStore | null = null;
export const getWorkspaceSnapshotStore = () => {
  if (!workspaceSnapshotStore) {
    workspaceSnapshotStore = new WorkspaceSnapshotStore();
    // For debugging purposes
    if (typeof window !== 'undefined')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).workspaceSnapshotStore = workspaceSnapshotStore;
  }

  return workspaceSnapshotStore;
};
