import { EventName } from './EventName';

type EventListener = (eventName: EventName) => void;

export class EventManager {
  private eventListeners: Record<EventName, Set<EventListener>> = {
    [EventName.ArtifactCreated]: new Set(),
    [EventName.ArtifactTitleUpdated]: new Set(),
    [EventName.ArtifactPinned]: new Set(),
  };

  addEventListener(listener: EventListener, eventNames: EventName[]) {
    for (const eventName of eventNames) {
      this.eventListeners[eventName].add(listener);
    }
  }

  removeEventListener(listener: EventListener, eventNames: EventName[]) {
    for (const eventName of eventNames) {
      this.eventListeners[eventName].delete(listener);
    }
  }

  broadcast(eventNames: EventName[]) {
    for (const eventName of eventNames) {
      this.eventListeners[eventName].forEach((listener) => listener(eventName));
    }
  }
}
