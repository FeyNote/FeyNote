import { EventData } from './EventData';
import { EventName } from './EventName';

type BroadcastDataArgs<T extends EventName> = [EventData[T]] extends [void]
  ? []
  : [eventData: EventData[T]];

type EventListener = <T extends EventName>(
  eventName: T,
  data: EventData[T],
) => void;
type NarrowedEventListener<T extends EventName> = (
  eventName: T,
  data: EventData[T],
) => void;

export class EventManager {
  private eventListeners: Record<EventName, Set<EventListener>> = Object.values(
    EventName,
  ).reduce(
    (acc, eventName) => {
      acc[eventName] = new Set();
      return acc;
    },
    {} as Record<EventName, Set<EventListener>>,
  );
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
    eventNames: T,
    listener: NarrowedEventListener<T>,
  ): void;
  addEventListener<T extends EventName>(
    eventNames: T[],
    listener: EventListener,
  ): void;
  addEventListener<T extends EventName>(
    eventNames: T | T[],
    listener: EventListener,
  ): void {
    if (Array.isArray(eventNames)) {
      for (const eventName of eventNames) {
        this.eventListeners[eventName].add(listener);
      }
    } else {
      this.eventListeners[eventNames].add(listener);
    }
  }

  removeEventListener<T extends EventName>(
    eventNames: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: NarrowedEventListener<any>,
  ): void;
  removeEventListener<T extends EventName>(
    eventNames: T[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: NarrowedEventListener<any>,
  ): void;
  removeEventListener<T extends EventName>(
    eventNames: T | T[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: NarrowedEventListener<any>,
  ): void {
    if (Array.isArray(eventNames)) {
      for (const eventName of eventNames) {
        this.eventListeners[eventName].delete(listener);
      }
    } else {
      this.eventListeners[eventNames].delete(listener);
    }
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
    this.eventListeners[eventName].forEach((listener) =>
      listener(eventName, eventData),
    );
  }
}

export const eventManager = new EventManager();
