/**
 * Types and interfaces for the Vizion Gateway SDK
 */

/**
 * Configuration options for the SDK
 */
export interface VizionGatewayConfig {
  /** API Key for authentication */
  apiKey: string;
  /** Merchant ID for the account */
  merchantId: string;
  /** Base URL for the API (optional) */
  baseUrl?: string;
  /** Timeout for API requests in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Payment transaction details
 */
export interface PaymentDetails {
  /** Amount to charge in cents */
  amount: number;
  /** Currency code (e.g., 'USD', 'JMD') */
  currency: string;
  /** Optional customer identifier */
  customerId?: string;
  /** Payment source identifier */
  sourceId?: string;
  /** Payment destination identifier */
  destinationId?: string;
  /** Unique order identifier */
  orderId?: string;
  /** Payment description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Card payment details
 */
export interface CardPaymentDetails {
  /** Card number */
  cardNumber: string;
  /** Expiration month (1-12) */
  expiryMonth: number;
  /** Expiration year (4 digits) */
  expiryYear: number;
  /** CVV/CVC security code */
  cvv: string;
  /** Cardholder name */
  cardholderName: string;
  /** Billing address details */
  billingAddress?: BillingAddress;
}

/**
 * Billing address details
 */
export interface BillingAddress {
  /** Street address */
  line1: string;
  /** Additional address info (apt, suite, etc.) */
  line2?: string;
  /** City */
  city: string;
  /** State or province */
  state?: string;
  /** Postal or ZIP code */
  postalCode: string;
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
}

/**
 * Payment form configuration options
 */
export interface PaymentFormOptions {
  /** Container element or selector */
  container: string | HTMLElement;
  /** Amount to charge in cents */
  amount: number;
  /** Currency code */
  currency: string;
  /** Unique order identifier */
  orderId?: string;
  /** Payment source identifier */
  sourceId?: string;
  /** Payment destination identifier */
  destinationId?: string;
  /** Payment description */
  description?: string;
  /** Custom styles */
  styles?: PaymentFormStyles;
  /** Success callback */
  onSuccess?: (result: TransactionResult) => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Cancel callback */
  onCancel?: () => void;
}

/**
 * Custom styling for the payment form
 */
export interface PaymentFormStyles {
  /** Base styles for all form elements */
  base?: {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
  };
  /** Field-specific styles */
  fields?: {
    cardNumber?: FieldStyle;
    cardExpiry?: FieldStyle;
    cardCvv?: FieldStyle;
    cardholderName?: FieldStyle;
  };
  /** Button styles */
  button?: {
    backgroundColor?: string;
    textColor?: string;
    hoverColor?: string;
    borderRadius?: string;
  };
}

/**
 * Individual field styling
 */
export interface FieldStyle {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  placeholder?: {
    color?: string;
  };
  focus?: {
    borderColor?: string;
  };
  error?: {
    borderColor?: string;
    color?: string;
  };
}

/**
 * Transaction result returned after successful payment
 */
export interface TransactionResult {
  /** Transaction ID */
  transactionId: string;
  /** Transaction status */
  status: 'succeeded' | 'pending' | 'failed';
  /** Amount charged */
  amount: number;
  /** Currency code */
  currency: string;
  /** Payment method details */
  paymentMethod: {
    type: string;
    last4?: string;
    brand?: string;
  };
  /** Timestamp of the transaction */
  createdAt: string;
  /** Order ID associated with the transaction */
  orderId?: string;
  /** Receipt URL */
  receiptUrl?: string;
} 