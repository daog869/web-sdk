/**
 * Supported currencies for payments
 */
export enum Currency {
  USD = 'USD',
  XCD = 'XCD',
  BBD = 'BBD',
  JMD = 'JMD',
  TTD = 'TTD'
}

/**
 * Payment status types
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partially_refunded'
}

/**
 * Card payment request
 */
export interface PaymentRequest {
  amount: number;
  currency: Currency;
  sourceId: string;
  destinationId: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, any>;
  card?: CardDetails;
}

/**
 * Card payment details
 */
export interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  holderName: string;
  billingAddress?: Address;
}

/**
 * Address information
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/**
 * Payment response
 */
export interface PaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  errorCode?: string;
  receiptUrl?: string;
} 