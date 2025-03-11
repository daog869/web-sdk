/**
 * Vizion Gateway SDK for Payment Processing
 * @module VizionGateway
 */

export * from './types';
export * from './client';
export * from './paymentForm';
export * from './errors';
export * from './utils';

// Re-export the main classes and functions
import { VizionGatewayClient } from './client';
import { PaymentForm } from './paymentForm';
import { ErrorType, VizionGatewayError } from './errors';
import { version } from './utils';

export default {
  VizionGatewayClient,
  PaymentForm,
  ErrorType,
  VizionGatewayError,
  version
}; 