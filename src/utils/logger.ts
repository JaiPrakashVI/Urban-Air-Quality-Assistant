/**
 * Enterprise Diagnostic Logger for AeroShield
 * Provides structured logging in development and test environments
 * while eliminating console pollution and leaking sensitive telemetry in production.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class DiagnosticLogger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[AeroShield][${timestamp}][${level.toUpperCase()}]: ${message}`;
  }

  public info(message: string, context?: LogContext | unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), context ?? '');
    }
  }

  public warn(message: string, context?: LogContext | unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message), context ?? '');
    }
  }

  public error(message: string, context?: LogContext | unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message), context ?? '');
    }
  }
}

export const logger = new DiagnosticLogger();
