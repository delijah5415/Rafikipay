/**
 * Base class for external payment provider integrations.
 *
 * Centralizes the config-resolution and structured-logging boilerplate that
 * was previously duplicated across each provider service (M-Pesa, PayPal,
 * bank transfers, ...). Concrete services extend this class, declare their
 * `provider` name, and read their configuration via `env()`.
 */
export abstract class BasePaymentService {
  /** Human-readable provider name, used to tag log output. */
  protected abstract readonly provider: string;

  /**
   * Read an environment variable with an optional fallback.
   */
  protected env(key: string, fallback = ''): string {
    return process.env[key] || fallback;
  }

  /**
   * Structured, provider-tagged logging for payment operations.
   */
  protected log(action: string, payload?: unknown): void {
    console.log(`[${this.provider}] ${action}`, payload ?? '');
  }
}
