/**
 * OpenTelemetry Instrumentation Setup
 *
 * Configures OpenTelemetry SDK for distributed tracing.
 * In development, traces are exported to console.
 * In production, can be configured to export to vendors (Datadog, Honeycomb, etc.)
 *
 * @module shared/infrastructure/logging
 */

import {NodeSDK} from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

type InstrumentationConfig = {
  serviceName: string;
  environment: string;
  enabled?: boolean;
};

export class ObservabilityInstrumentation {
  private sdk: NodeSDK | undefined = undefined;
  private readonly config: InstrumentationConfig;

  constructor(config: InstrumentationConfig) {
    this.config = {
      serviceName: config.serviceName ?? 'sessioflow',
      environment: config.environment ?? 'development',
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  init(): void {
    if (!this.config.enabled) {
      console.log('[Observability] Disabled');
      return;
    }

    try {
      // Create resource with service metadata
      const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.config.serviceName,
        [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.1.0',
        'service.environment': this.config.environment,
      });

      // Configure span processor
      const spanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        spanProcessors: [spanProcessor],
      });

      this.sdk.start();
      console.log(
        `[Observability] Initialized for ${this.config.serviceName} (${this.config.environment})`,
      );
    } catch (error) {
      console.error('[Observability] Failed to initialize:', error);
    }
  }

  /**
   * Shutdown OpenTelemetry SDK
   * Call this on application shutdown to flush remaining spans
   */
  async shutdown(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.shutdown();
        console.log('[Observability] Shutdown complete');
      } catch (error) {
        console.error('[Observability] Error during shutdown:', error);
      }
    }
  }

  /**
   * Get the SDK instance (for advanced usage)
   */
  getSdk(): NodeSDK | undefined {
    return this.sdk;
  }
}

// Global instrumentation instance
let instrumentation: ObservabilityInstrumentation | undefined = undefined;

export function initObservability(
  config?: Partial<InstrumentationConfig>,
): ObservabilityInstrumentation {
  if (!instrumentation) {
    const defaultConfig: InstrumentationConfig = {
      serviceName: config?.serviceName ?? 'sessioflow',
      environment: config?.environment ?? process.env.NODE_ENV ?? 'development',
      enabled: config?.enabled ?? process.env.NODE_ENV !== 'test',
    };

    instrumentation = new ObservabilityInstrumentation(defaultConfig);
    instrumentation.init();
  }

  return instrumentation;
}

export function getObservability(): ObservabilityInstrumentation | undefined {
  return instrumentation;
}

export async function shutdownObservability(): Promise<void> {
  if (instrumentation) {
    await instrumentation.shutdown();
    instrumentation = undefined;
  }
}
