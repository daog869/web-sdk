/**
 * Utilities for the Vizion Gateway SDK
 */

/**
 * SDK version number
 * @see package.json
 */
export const version = '1.0.0';

/**
 * Format amount for display with currency
 * @param amount Amount in cents
 * @param currency Currency code
 * @returns Formatted amount string
 */
export function formatAmount(amount: number, currency: string): string {
  const currencySymbol = getCurrencySymbol(currency);
  const value = (amount / 100).toFixed(2);
  
  return `${currencySymbol}${value} ${currency}`;
}

/**
 * Get currency symbol for a currency code
 * @param currency Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    JMD: 'J$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    BBD: 'Bds$',
    TTD: 'TT$'
  };
  
  return symbols[currency] || '';
}

/**
 * Validate a credit card number using Luhn algorithm
 * @param cardNumber Card number to validate
 * @returns Whether the card number is valid
 */
export function validateCardNumber(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

/**
 * Detect card type from card number
 * @param cardNumber Card number
 * @returns Card type (visa, mastercard, amex, etc.) or undefined
 */
export function detectCardType(cardNumber: string): string | undefined {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return undefined;
  }

  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');

  // Card type patterns
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^(6011|65|64[4-9]|622)/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(digits)) {
      return type;
    }
  }

  return undefined;
}

/**
 * Get current timestamp in ISO format
 * @returns ISO timestamp string
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate a random order ID
 * @param prefix Prefix for the order ID
 * @returns Random order ID string
 */
export function generateOrderId(prefix = 'order'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
} 