/**
 * Class which represent registered event listener and can be used to unregister from
 * events (dispose).
 */
export class ListenerToken {
  /** Token invalidation callback provided by {@see EventEmitter}. */
  private invalidateAction?: () => void
  /** Whether token still valid or not. */
  private isValid = true

  constructor(invalidateAction: () => void) {
    this.invalidateAction = invalidateAction
  }

  /**
   * Invalidate token object.
   *
   * @returns `true` if token successfully invalidated.
   */
  public invalidate(): boolean {
    if (!this.isValid) return false

    this.isValid = false
    this.invalidateAction()
    this.invalidateAction = null
    return true
  }
}
