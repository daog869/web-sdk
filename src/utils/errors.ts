/**
 * Error types used by the SDK
 */
export enum ErrorType {
  CONFIGURATION_ERROR = 'configuration_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  VALIDATION_ERROR = 'validation_error',
  PAYMENT_PROCESSING_ERROR = 'payment_processing_error',
  TRANSACTION_RETRIEVAL_ERROR = 'transaction_retrieval_error',
  REFUND_PROCESSING_ERROR = 'refund_processing_error',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Custom error class for SDK errors
 */
export class VizionGatewayError extends Error {
  code: string;
  statusCode: number;
  
  /**
   * Create a new VizionGatewayError
   * @param message Error message
   * @param code Error code
   * @param statusCode HTTP status code (if applicable)
   */
  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'VizionGatewayError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintaining proper prototype chain in TypeScript
    Object.setPrototypeOf(this, VizionGatewayError.prototype);
  }
  
  /**
   * Create a formatted error message with details
   */
  public toFormattedString(): string {
    return `VizionGatewayError [${this.code}] (${this.statusCode}): ${this.message}`;
  }
  
  /**
   * Convert error to JSON
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode
    };
  }
} 