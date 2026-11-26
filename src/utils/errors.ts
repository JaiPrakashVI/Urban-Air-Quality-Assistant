/**
 * Typed custom error hierarchy for AeroShield application layers.
 */

export class AtmosphericApiError extends Error {
  constructor(message: string, public statusCode?: number, public endpoint?: string) {
    super(message);
    this.name = 'AtmosphericApiError';
    Object.setPrototypeOf(this, AtmosphericApiError.prototype);
  }
}

export class GeocodingError extends Error {
  constructor(message: string, public query?: string) {
    super(message);
    this.name = 'GeocodingError';
    Object.setPrototypeOf(this, GeocodingError.prototype);
  }
}

export class AssistantServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AssistantServiceError';
    Object.setPrototypeOf(this, AssistantServiceError.prototype);
  }
}
