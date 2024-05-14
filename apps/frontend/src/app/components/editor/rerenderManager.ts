export class RerenderManager {
  eventListeners = [] as (() => void)[];

  addEventListener(listener: () => void) {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: () => void) {
    const idx = this.eventListeners.indexOf(listener);
    if (idx > -1) this.eventListeners.splice(idx, 1);
  }

  call() {
    this.eventListeners.forEach((listener) => listener());
  }
}
