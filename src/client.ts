import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { 
  VizionGatewayConfig, 
  PaymentDetails, 
  CardPaymentDetails,
  TransactionResult
} from './types';
import { VizionGatewayError, ErrorType } from './errors';
import { version } from './utils';

/**
 * Main client for interacting with the Vizion Gateway API
 */
export class VizionGatewayClient {
  private apiKey: string;
  private merchantId: string;
  private http: AxiosInstance;

  /**
   * Creates a new Vizion Gateway client
   * @param config Configuration options
   */
  constructor(config: VizionGatewayConfig) {
    this.apiKey = config.apiKey;
    this.merchantId = config.merchantId;

    const baseURL = config.baseUrl || 'https://api.viziongateway.com/v1';
    const timeout = config.timeout || 30000;

    this.http = axios.create({
      baseURL,
      timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Merchant-ID': this.merchantId,
        'Content-Type': 'application/json',
        'X-SDK-Version': `javascript-${version}`,
        'X-SDK-Platform': 'web'
      }
    });

    // Add response interceptor for error handling
    this.http.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            return Promise.reject(new VizionGatewayError(
              'Authentication failed. Check your API key and merchant ID.',
              ErrorType.AUTHENTICATION
            ));
          }
          
          if (status === 400) {
            return Promise.reject(new VizionGatewayError(
              (data as any).message || 'Invalid request parameters',
              ErrorType.VALIDATION,
              (data as any).errors
            ));
          }
          
          return Promise.reject(new VizionGatewayError(
            (data as any).message || 'An error occurred while processing your request',
            ErrorType.API,
            (data as any).errors
          ));
        }
        
        if (error.request) {
          return Promise.reject(new VizionGatewayError(
            'Network error. Please check your connection.',
            ErrorType.NETWORK
          ));
        }
        
        return Promise.reject(new VizionGatewayError(
          error.message || 'An unexpected error occurred',
          ErrorType.UNKNOWN
        ));
      }
    );
  }

  /**
   * Process a card payment
   * @param paymentDetails Payment transaction details
   * @param cardDetails Card payment details
   * @returns Transaction result
   */
  async processCardPayment(
    paymentDetails: PaymentDetails,
    cardDetails: CardPaymentDetails
  ): Promise<TransactionResult> {
    try {
      const response = await this.http.post('/payments', {
        ...paymentDetails,
        paymentMethod: {
          type: 'card',
          card: {
            number: cardDetails.cardNumber,
            exp_month: cardDetails.expiryMonth,
            exp_year: cardDetails.expiryYear,
            cvv: cardDetails.cvv,
            name: cardDetails.cardholderName,
            address: cardDetails.billingAddress
          }
        }
      });

      return response.data.transaction;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to process card payment',
        ErrorType.PAYMENT_PROCESSING,
        error
      );
    }
  }

  /**
   * Retrieve a transaction by ID
   * @param transactionId Transaction ID
   * @returns Transaction details
   */
  async getTransaction(transactionId: string): Promise<TransactionResult> {
    try {
      const response = await this.http.get(`/transactions/${transactionId}`);
      return response.data.transaction;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to retrieve transaction',
        ErrorType.API,
        error
      );
    }
  }

  /**
   * List transactions with pagination
   * @param limit Maximum number of transactions to return
   * @param startingAfter Cursor for pagination (transaction ID)
   * @returns List of transactions
   */
  async listTransactions(limit = 10, startingAfter?: string): Promise<{
    transactions: TransactionResult[];
    hasMore: boolean;
  }> {
    try {
      const params: Record<string, any> = { limit };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await this.http.get('/transactions', { params });
      
      return {
        transactions: response.data.transactions,
        hasMore: response.data.has_more
      };
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to list transactions',
        ErrorType.API,
        error
      );
    }
  }

  /**
   * Process a refund for a transaction
   * @param transactionId Transaction ID to refund
   * @param amount Amount to refund (if partial refund)
   * @returns Refund transaction result
   */
  async refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<TransactionResult> {
    try {
      const payload: Record<string, any> = {};
      if (amount !== undefined) {
        payload.amount = amount;
      }

      const response = await this.http.post(
        `/transactions/${transactionId}/refund`,
        payload
      );
      
      return response.data.transaction;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to process refund',
        ErrorType.REFUND_PROCESSING,
        error
      );
    }
  }
} 