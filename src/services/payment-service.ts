import axios, { AxiosInstance } from 'axios';
import { VizionGatewayConfig, Environment } from '../vizion-gateway';
import { PaymentRequest, PaymentResponse } from '../models/payment';
import { Transaction } from '../models/transaction';
import { VizionGatewayError, ErrorType } from '../utils/errors';

/**
 * Service for processing payments through the Vizion Gateway API
 */
export class PaymentService {
  private apiClient: AxiosInstance;
  private config: VizionGatewayConfig;
  
  constructor(config: VizionGatewayConfig) {
    this.config = config;
    
    // Set up API client with appropriate base URL based on environment
    const baseURL = config.environment === Environment.PRODUCTION
      ? 'https://api.viziongateway.com/v1'
      : 'https://sandbox-api.viziongateway.com/v1';
      
    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Merchant-ID': config.merchantId
      }
    });
    
    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      response => response,
      error => {
        const errorResponse = error.response?.data || { message: 'Unknown error occurred' };
        throw new VizionGatewayError(
          errorResponse.message,
          errorResponse.code || 'unknown_error',
          error.response?.status || 500
        );
      }
    );
  }
  
  /**
   * Process a card payment
   * @param paymentRequest Payment details
   * @returns Promise with payment response
   */
  public async processCardPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.post('/payments/card', paymentRequest);
      return response.data;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to process card payment',
        ErrorType.PAYMENT_PROCESSING_ERROR,
        500
      );
    }
  }
  
  /**
   * Get transaction by ID
   * @param transactionId ID of the transaction to retrieve
   * @returns Promise with transaction details
   */
  public async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.apiClient.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to retrieve transaction',
        ErrorType.TRANSACTION_RETRIEVAL_ERROR,
        500
      );
    }
  }
  
  /**
   * List transactions with optional filtering
   * @param params Optional parameters for filtering transactions
   * @returns Promise with list of transactions
   */
  public async listTransactions(params: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  } = {}): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      const response = await this.apiClient.get('/transactions', { params });
      return response.data;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to list transactions',
        ErrorType.TRANSACTION_RETRIEVAL_ERROR,
        500
      );
    }
  }
  
  /**
   * Process a refund
   * @param transactionId ID of the transaction to refund
   * @param amount Amount to refund (optional, defaults to full amount)
   * @param reason Reason for the refund
   * @returns Promise with refund details
   */
  public async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResponse> {
    try {
      const response = await this.apiClient.post(`/transactions/${transactionId}/refund`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      if (error instanceof VizionGatewayError) {
        throw error;
      }
      throw new VizionGatewayError(
        'Failed to process refund',
        ErrorType.REFUND_PROCESSING_ERROR,
        500
      );
    }
  }
} 