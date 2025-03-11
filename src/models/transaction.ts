import { Currency, PaymentStatus } from './payment';

/**
 * Transaction types
 */
export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  PAYOUT = 'payout'
}

/**
 * Transaction details
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  sourceId: string;
  destinationId: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  paymentMethod: PaymentMethod;
  refunds?: Refund[];
  receiptUrl?: string;
}

/**
 * Payment method details
 */
export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'mobile_money';
  details: CardPaymentMethod | BankTransferMethod | MobileMoneyMethod;
}

/**
 * Card payment method details
 */
export interface CardPaymentMethod {
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  country?: string;
}

/**
 * Bank transfer payment method details
 */
export interface BankTransferMethod {
  bankName: string;
  accountLast4: string;
  accountType: string;
  country: string;
}

/**
 * Mobile money payment method details
 */
export interface MobileMoneyMethod {
  provider: string;
  phoneNumber: string;
  country: string;
}

/**
 * Refund details
 */
export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
} 