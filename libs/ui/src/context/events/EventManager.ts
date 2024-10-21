import { EventData } from './EventData';
import { EventName } from './EventName';

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

  removeEventListener(
    eventNames: EventName[],
    listener: NarrowedEventListener<any>,
  ): void;
  removeEventListener(
    eventNames: EventName,
    listener: NarrowedEventListener<any>,
  ): void;
  removeEventListener(
    eventNames: EventName | EventName[],
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

  broadcast<T extends EventName>(eventName: T, data: EventData[T]) {
    this.eventListeners[eventName].forEach((listener) =>
      listener(eventName, data),
    );
  }
}

export const eventManager = new EventManager();
