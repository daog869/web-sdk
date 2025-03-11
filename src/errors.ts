/**
 * Error types for Vizion Gateway SDK
 */
export enum ErrorType {
  /** Authentication error */
  AUTHENTICATION = 'authentication_error',
  /** Validation error */
  VALIDATION = 'validation_error',
  /** API error */
  API = 'api_error',
  /** Network error */
  NETWORK = 'network_error',
  /** Payment processing error */
  PAYMENT_PROCESSING = 'payment_processing_error',
  /** Refund processing error */
  REFUND_PROCESSING = 'refund_processing_error',
  /** Unknown error */
  UNKNOWN = 'unknown_error'
}

/**
 * Custom error class for Vizion Gateway SDK
 */
export class VizionGatewayError extends Error {
  /** Error type */
  type: ErrorType;
  /** Error details */
  details?: any;
  /** HTTP status code if applicable */
  statusCode?: number;

  /**
   * Creates a new VizionGatewayError
   * @param message Error message
   * @param type Error type
   * @param details Additional error details
   * @param statusCode HTTP status code
   */
  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    details?: any,
    statusCode?: number
  ) {
    super(message);
    this.name = 'VizionGatewayError';
    this.type = type;
    this.details = details;
    this.statusCode = statusCode;

    // Ensures proper inheritance in ES5
    Object.setPrototypeOf(this, VizionGatewayError.prototype);
  }

  /**
   * Returns a string representation of the error
   */
  toString(): string {
    return `${this.name} [${this.type}]: ${this.message}`;
  }

  /**
   * Returns a plain object representation of the error
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      statusCode: this.statusCode
    };
  }
} 