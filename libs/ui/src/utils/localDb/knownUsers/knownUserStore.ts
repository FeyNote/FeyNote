import { eventManager } from '../../../context/events/EventManager';
import { EventName } from '../../../context/events/EventName';
import { trpc } from '../../trpc';
import type { KnownUserDoc } from '../../localDb';

/**
 * Please do not interact with this class directly from React if avoidable.
 * Use our many custom use* hooks instead.
 */
class KnownUserStore {
  /**
   * Pseudo-react context like, that keeps track of what listeners are interested in what users
   */
  private listenersForSpecificUserId: Record<string, Set<() => void>> = {};
  private listenersForAnyUpdate = new Set<() => void>();
  private listenersForFetchFailure = new Set<(e: unknown) => void>();

  /**
   * Helps us invalidate in-flight requests when a session changes
   */
  private sessionInvalidationRandom = crypto.randomUUID();

  private knownUsersById = new Map<string, KnownUserDoc>();

  private _isLoading = true;
  // Readonly to external consumers.
  public get isLoading() {
    return this._isLoading;
  }

  constructor() {
    eventManager.addEventListener(EventName.LocaldbSessionUpdated, async () => {
      this.knownUsersById.clear();
      this.sessionInvalidationRandom = crypto.randomUUID();
      this._isLoading = true;
      this.notify();

      this.loadAllKnownUsers().then(() => {
        this._isLoading = false;
        this.notify();
      });
    });
    eventManager.addEventListener(
      EventName.LocaldbKnownUsersUpdated,
      async () => {
        await this.loadAllKnownUsers();
        this.notify();
      },
    );

    this.loadAllKnownUsers().then(() => {
      this._isLoading = false;
      this.notify();
    });

    // For contextless use within React
    this.getKnownUsersById = this.getKnownUsersById.bind(this);
    this.getKnownUserById = this.getKnownUserById.bind(this);
    this.listen = this.listen.bind(this);
    this.listenForUserId = this.listenForUserId.bind(this);
    this.listenForFetchFailure = this.listenForFetchFailure.bind(this);
  }

  public getKnownUsersById(): ReadonlyMap<string, KnownUserDoc> {
    return this.knownUsersById;
  }

  public getKnownUserById(id: string): KnownUserDoc | undefined {
    return this.knownUsersById.get(id);
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

  public listenForUserId(userId: string, listener: () => void) {
    this.listenersForSpecificUserId[userId] ||= new Set();
    this.listenersForSpecificUserId[userId].add(listener);

    return () => {
      this.listenersForSpecificUserId[userId].delete(listener);
      if (this.listenersForSpecificUserId[userId].size === 0) {
        delete this.listenersForSpecificUserId[userId];
      }
    };
  }

  /**
   * Loading a specific user is not supported at this time, since
   * knownUsers is kinda calculated based on what artifacts you have access to
   */
  private async loadAllKnownUsers() {
    const sessionRandomBefore = this.sessionInvalidationRandom;
    const result = await trpc.user.getKnownUsers.query().catch((e) => {
      this.notifyFetchError(e);
    });
    if (!result) return;
    if (sessionRandomBefore !== this.sessionInvalidationRandom) return;

    this.knownUsersById = new Map(result.map((el) => [el.id, el]));
  }

  /**
   * Notifies all of the listeners stored on this class.
   * If userIds argument is omitted, notifies all listeners.
   */
  private notify(userIds?: string[]) {
    let _userIds = userIds;
    if (!_userIds) {
      _userIds = Object.keys(this.listenersForSpecificUserId);
    }

    for (const userId of _userIds) {
      const listeners = this.listenersForSpecificUserId[userId];
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

let knownUserStore: KnownUserStore | null = null;
export const getKnownUserStore = () => {
  if (!knownUserStore) {
    knownUserStore = new KnownUserStore();
  }

  return knownUserStore;
};
