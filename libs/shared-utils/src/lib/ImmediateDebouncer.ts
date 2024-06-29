export class ImmediateDebouncer<F extends () => any> {
  pendingPromise: Promise<ReturnType<F>> | null = null;
  timeout: NodeJS.Timeout | null = null;
  followupCallTimeout: NodeJS.Timeout | null = null;

  constructor(
    private method: F,
    private debounceTime: number,
    private options?: {
      /**
       * Call the method one more time after the debounce is up
       * for instance, for re-fetching potentially stale data
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
    }

    if (!this.pendingPromise)
      this.pendingPromise = Promise.resolve(this.method());

    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.pendingPromise = null;
      }, this.debounceTime);
    }

    if (this.options?.enableFollowupCall) {
      if (this.followupCallTimeout) clearTimeout(this.followupCallTimeout);
      this.followupCallTimeout = setTimeout(() => {
        this.method();
      }, this.debounceTime);
    }

    return this.pendingPromise!;
  }
}
