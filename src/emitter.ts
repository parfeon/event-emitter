import {ListenerToken} from './token'


/** Simple strongly typed event listener / emitter. */
export class EventEmitter<T extends { [event: string]: (...args) => void }> {
  /** List of active event listener tokens. */
  private tokens: Set<ListenerToken> = new Set()

  /** Keeping track on our registered listeners. */
  private readonly listeners: Partial<
    Record<keyof T, Array<(...args: Parameters<T[keyof T]>) => void>>
  >

  /**
   * Retrieve list of events which has active listeners.
   *
   * @returns List of event names with registered listeners.
   */
  get eventNames(): Array<keyof T> {
    return Object.keys(this.listeners)
  }

  /**
   * Retrieve overall listeners count for all known events.
   *
   * @param eventName Name of event for which number of listeners should be retrieved.
   * @returns All listeners count.
   */
  listenersCount(eventName?: keyof T) {
    let listenersCount = 0
    const listeners = eventName ? [this.listeners[eventName] ?? []] : Object.values(this.listeners)
    listeners.map(listeners => listenersCount += listeners.length)
    return listenersCount
  }

  constructor() {
    this.listeners = <typeof this.listeners>{}
  }

  /**
   * Add `event` listener function.
   *
   * @param event Name of event which will trigger provided listener.
   * @param listener Function which should be called with each emitted `event`.
   * @returns Listener token which can be used to {@see ListenerToken.invalidate} listener,
   * so it won't be called for emitted events.
   */
  on<E extends keyof T>(event: E, listener: (...args: Parameters<T[E]>) => void) {
    const listeners = this.listeners[event]

    // Append listener to existing or create new event listeners list.
    if (listeners) listeners.push(listener)
    else this.listeners[event] = [listener]

    const token = new ListenerToken(() => {
      this.tokens.delete(token)
      this.removeListener(event, listener)
    })
    this.tokens.add(token)

    return token
  }

  /**
   * Add one time `event` listener function.
   * Added listeners will be called only once for specified `event` and then token for it will be
   * invalidated.
   *
   * @param event Name of event which will trigger provided listener.
   * @param listener Function which should be called with each emitted `event`.
   * @returns Listener token which can be used to {@see ListenerToken.invalidate} listener,
   * so it won't be called for emitted events.
   */
  once<E extends keyof T>(event: E, listener: (...args: Parameters<T[E]>) => void) {
    /**
     * Wrapper function which will invalidate listener token as soon as observed event will be
     * triggered and handled.
     *
     * @param args List of arguments which is expected by original handler.
     */
    const wrapper = (...args: Parameters<T[E]>) => {
      listener(...args)
      token.invalidate()
    }

    const token = this.on(event, wrapper)
    return token
  }

  /**
   * Emit `event` which will call registered listeners.
   *
   * @param event Name of event for which listeners should be called.
   * @param args List of arguments which should be passed to registered listener.
   */
  emit<E extends string & keyof T>(event: E, ...args: Parameters<T[E]>) {
    const listeners = this.listeners[event] ?? []

    /**
     * Iterate through copy of listeners, so it won't be modified with `once` callbacks processing.
     */
    listeners.slice().map(listener => listener(...args))
  }

  /**
   * Remove any registered event listeners.
   * Listener tokens for registered listeners will be invalidated.
   */
  removeAllListeners() {
    Array.from(this.tokens).map(token => token.invalidate())
  }

  /**
   * Remove particular event observer instance.
   *
   * @param event Event name from events map for which observer should be removed.
   * @param listener Event handler function which should be removed.
   * @private
   */
  private removeListener<E extends keyof T>(
    event: E,
    listener: (...args: Parameters<T[E]>) => void
  ) {
    const listeners = this.listeners[event]

    // Remove provided handler from list of event observers.
    const idx = listeners.indexOf(listener)
    if (idx >= 0) listeners.splice(idx, 1)

    // Clean up list of observed events if there is no listeners.
    if (listeners.length === 0) delete this.listeners[event]
  }
}
