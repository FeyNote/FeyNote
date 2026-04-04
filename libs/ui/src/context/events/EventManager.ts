import { EventData } from './EventData';
import { EventName } from './EventName';

type BroadcastDataArgs<T extends EventName> = [EventData[T]] extends [void]
  ? []
  : [eventData: EventData[T]];

type EventListener<T extends EventName> = (data: EventData[T]) => void;

type EventListenersRecord = {
  [key in EventName]: Set<EventListener<key>>;
};

export class EventManager {
  private eventListeners: EventListenersRecord = Object.values(
    EventName,
  ).reduce((acc, eventName) => {
    acc[eventName] = new Set<EventListener<typeof eventName>>();
    return acc;
  }, {} as EventListenersRecord);
  private broadcastChannel: BroadcastChannel;
  /**
   * These are events that should cross the window boundary to other tabs/workers, facilitated by a BroadcastChannel.
   * WARNING: Do not use this for events that are received by all tabs, such as websocket events. If you do, the event will be
   * triggered multiple times.
   */
  private crossDomainEvents: ReadonlySet<EventName> = new Set([
    EventName.LocaldbSessionUpdated,
    EventName.LocaldbEdgesUpdated,
    EventName.LocaldbSyncArtifact,
    EventName.LocaldbSyncCompleted,
    EventName.LocaldbArtifactSnapshotUpdated,
    EventName.LocaldbWorkspaceSnapshotUpdated,
    EventName.LocaldbKnownUsersUpdated,
  ]);

  constructor() {
    this.broadcastChannel = new BroadcastChannel('EventManager');

    this.broadcastChannel.addEventListener('message', (event) => {
      const { eventName, eventData } = event.data;

      this.callEventListeners(eventName, eventData);
    });
  }

  addEventListener<T extends EventName>(
    eventName: T,
    listener: EventListener<T>,
  ): () => void {
    this.eventListeners[eventName].add(listener);

    return () => {
      this.removeEventListener(eventName, listener);
    };
  }

  removeEventListener<T extends EventName>(
    eventName: T,
    listener: EventListener<T>,
  ): void {
    this.eventListeners[eventName].delete(listener);
  }

  broadcast<T extends EventName>(eventName: T, ...args: BroadcastDataArgs<T>) {
    const eventData = args[0] as EventData[T];
    this.callEventListeners(eventName, eventData);

    if (this.crossDomainEvents.has(eventName)) {
      this.broadcastChannel.postMessage({
        eventName,
        eventData,
      });
    }
  }

  private callEventListeners<T extends EventName>(
    eventName: T,
    eventData: EventData[T],
  ) {
    this.eventListeners[eventName].forEach((listener) => listener(eventData));
  }
}

export const eventManager = new EventManager();
