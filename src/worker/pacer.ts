// ============================================================================
// Adaptive Rate Controller & Pacer
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export class AdaptiveRatePacer {
  private targetMsgsPerMinute: number;
  private intervalMs: number;
  private lastDispatchTime: number = 0;

  constructor(targetMsgsPerMinute: number = 60) {
    this.targetMsgsPerMinute = targetMsgsPerMinute;
    this.intervalMs = Math.floor(60000 / Math.max(1, targetMsgsPerMinute));
  }

  /**
   * Adjusts pacing dynamically when Meta responds with rate limit or throughput throttle
   */
  public throttleBackoff() {
    this.targetMsgsPerMinute = Math.max(5, Math.floor(this.targetMsgsPerMinute * 0.5));
    this.intervalMs = Math.floor(60000 / this.targetMsgsPerMinute);
    console.warn(`[Pacer Throttled] Backed off to ${this.targetMsgsPerMinute} msgs/min (${this.intervalMs}ms interval)`);
  }

  public stepUp() {
    this.targetMsgsPerMinute = Math.min(600, Math.floor(this.targetMsgsPerMinute * 1.1));
    this.intervalMs = Math.floor(60000 / this.targetMsgsPerMinute);
  }

  /**
   * Delays execution if needed to conform to configured pacing window
   */
  async waitBeforeNextSend(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastDispatchTime;
    if (elapsed < this.intervalMs) {
      const waitTime = this.intervalMs - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastDispatchTime = Date.now();
  }
}

