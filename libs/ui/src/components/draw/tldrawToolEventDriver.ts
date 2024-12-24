export enum CustomTLDrawEventType {
  ReferencePointerDown = 'referencePointerDown',
}

class TLDdrawToolEventDriver {
  eventListeners: Record<CustomTLDrawEventType, (() => void)[]> = {
    [CustomTLDrawEventType.ReferencePointerDown]: [],
  };

  private dispatchEvent(eventType: CustomTLDrawEventType) {
    this.eventListeners[eventType].forEach((listener) => listener());
  }

  addEventListener(eventType: CustomTLDrawEventType, listener: () => void) {
    this.eventListeners[eventType].push(listener);
  }

  removeEventListener(eventType: CustomTLDrawEventType, listener: () => void) {
    this.eventListeners[eventType] = this.eventListeners[eventType].filter(
      (l) => l !== listener,
    );
  }

  dispatchReferencePointerDown() {
    this.dispatchEvent(CustomTLDrawEventType.ReferencePointerDown);
  }
}

export const tldrawToolEventDriver = new TLDdrawToolEventDriver();
