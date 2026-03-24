import { applyUpdate, mergeUpdates, Doc as YDoc } from 'yjs';

type EventHandlers = {
  synced: () => void;
  destroy: () => void;
};
type EventHandlerMap = {
  [key in keyof EventHandlers]: Set<EventHandlers[key]>;
};

type DocListener = (update: Uint8Array) => void;

export class YBroadcastChannelProvider {
  private static readonly CHANNEL_NAME = 'ydoc-sync';
  private static sharedChannel: BroadcastChannel | null = null;
  private static listenersByDocName = new Map<string, Set<DocListener>>();

  private static getSharedChannel() {
    if (!YBroadcastChannelProvider.sharedChannel) {
      YBroadcastChannelProvider.sharedChannel = new BroadcastChannel(
        YBroadcastChannelProvider.CHANNEL_NAME,
      );
      YBroadcastChannelProvider.sharedChannel.onmessage = (
        event: MessageEvent,
      ) => {
        const { docName, update } = event.data;
        const listeners =
          YBroadcastChannelProvider.listenersByDocName.get(docName);
        if (!listeners) return;

        const typedUpdate = new Uint8Array(update);
        for (const listener of listeners) {
          listener(typedUpdate);
        }
      };
    }
    return YBroadcastChannelProvider.sharedChannel;
  }

  private static subscribe(docName: string, listener: DocListener) {
    YBroadcastChannelProvider.getSharedChannel();
    let listeners = YBroadcastChannelProvider.listenersByDocName.get(docName);
    if (!listeners) {
      listeners = new Set();
      YBroadcastChannelProvider.listenersByDocName.set(docName, listeners);
    }
    listeners.add(listener);
  }

  private static unsubscribe(docName: string, listener: DocListener) {
    const listeners = YBroadcastChannelProvider.listenersByDocName.get(docName);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) {
      YBroadcastChannelProvider.listenersByDocName.delete(docName);
    }
    if (
      YBroadcastChannelProvider.listenersByDocName.size === 0 &&
      YBroadcastChannelProvider.sharedChannel
    ) {
      YBroadcastChannelProvider.sharedChannel.close();
      YBroadcastChannelProvider.sharedChannel = null;
    }
  }

  private static broadcast(docName: string, update: Uint8Array) {
    YBroadcastChannelProvider.getSharedChannel().postMessage({
      docName,
      update,
    });
  }

  private eventListeners: EventHandlerMap = {
    synced: new Set(),
    destroy: new Set(),
  } satisfies EventHandlerMap;

  private _destroyed = false;
  public get destroyed() {
    return this._destroyed;
  }
  private set destroyed(val: boolean) {
    this._destroyed = val;
  }

  private _synced = false;
  public get synced() {
    return this._synced;
  }
  private set synced(val: boolean) {
    this._synced = val;
  }

  private pendingUpdates: Uint8Array[] = [];
  private flushTimeout: ReturnType<typeof setTimeout> | null = null;
  private BATCH_INTERVAL_MS = 20;

  constructor(
    public readonly docName: string,
    public readonly doc: YDoc,
  ) {}

  public attach() {
    YBroadcastChannelProvider.subscribe(
      this.docName,
      this.handleChannelMessage,
    );

    this.doc.on('update', this.handleDocUpdate);
    this.doc.on('destroy', this.destroy);

    this.synced = true;
    this.emit('synced', []);
  }

  private handleDocUpdate = (
    update: Uint8Array<ArrayBufferLike>,
    origin: unknown,
  ) => {
    if (origin === this || this.destroyed) return;

    this.pendingUpdates.push(update);
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(this.flushUpdates, this.BATCH_INTERVAL_MS);
    }
  };

  private flushUpdates = () => {
    this.flushTimeout = null;
    if (this.destroyed || this.pendingUpdates.length === 0) return;

    const merged = mergeUpdates(this.pendingUpdates);
    this.pendingUpdates = [];
    YBroadcastChannelProvider.broadcast(this.docName, merged);
  };

  private handleChannelMessage = (update: Uint8Array) => {
    if (this.destroyed) return;

    applyUpdate(this.doc, update, this);
  };

  public on<T extends keyof EventHandlers>(name: T, cb: EventHandlers[T]) {
    this.eventListeners[name].add(cb);
  }

  public off<T extends keyof EventHandlers>(name: T, cb: EventHandlers[T]) {
    this.eventListeners[name].delete(cb);
  }

  public destroy = () => {
    if (this.destroyed) return;

    this.doc.off('update', this.handleDocUpdate);
    this.doc.off('destroy', this.destroy);
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    this.flushUpdates();
    YBroadcastChannelProvider.unsubscribe(
      this.docName,
      this.handleChannelMessage,
    );
    this.destroyed = true;
    this.emit('destroy', []);
  };

  private emit<T extends keyof EventHandlers>(
    name: T,
    args: Parameters<EventHandlers[T]>,
  ) {
    for (const eventListener of this.eventListeners[name] || []) {
      // eslint-disable-next-line prefer-spread, @typescript-eslint/no-explicit-any
      (eventListener as any).apply(null, args);
    }
  }
}
