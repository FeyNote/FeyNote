export class ImmediateDebouncer<F extends () => any> {
  pendingPromise: Promise<ReturnType<F>> | null = null;
  timeout: NodeJS.Timeout | null = null;
  needsFollowupCall = false;

  constructor(
    private method: F,
    private debounceTime: number,
    private options?: {
      /**
       * Schedule a call for the debounced method one more time after the debounce is up
       * if it's called again during the debounce wait. For instance, for re-fetching potentially stale data
       */
      enableFollowupCall?: boolean;
    },
  ) {}

  /**
   * Call the method provided to the debouncer. Return value will be stale if
   * call is made during the debounce interval
   * The immediate flag can be used to ensure this call is performed with zero delay
   */
  async call(immediate?: boolean): Promise<ReturnType<F>> {
    if (immediate) {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.pendingPromise = null;
      this.needsFollowupCall = false;
    }

    if (!this.pendingPromise) {
      this.pendingPromise = Promise.resolve(this.method());
    } else if (this.options?.enableFollowupCall) {
      this.needsFollowupCall = true;
    }

    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.pendingPromise = null;
        if (this.needsFollowupCall) {
          this.needsFollowupCall = false;
          this.call();
        }
      }, this.debounceTime);
    }

    return this.pendingPromise;
  }
}
