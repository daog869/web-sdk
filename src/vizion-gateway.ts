import { PaymentService } from './services/payment-service';

/**
 * Environment options for the SDK
 */
export enum Environment {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production'
}

/**
 * Configuration options for the SDK
 */
export interface VizionGatewayConfig {
  apiKey: string;
  merchantId: string;
  environment: Environment;
}

/**
 * Main class for the Vizion Gateway SDK
 */
export class VizionGateway {
  private static instance: VizionGateway;
  private config: VizionGatewayConfig;
  private paymentService: PaymentService;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config: VizionGatewayConfig) {
    this.config = config;
    this.paymentService = new PaymentService(config);
  }
  
  /**
   * Initialize the SDK with the provided configuration
   * @param config Configuration options
   */
  public static initialize(config: VizionGatewayConfig): VizionGateway {
    if (!VizionGateway.instance) {
      VizionGateway.instance = new VizionGateway(config);
      console.log(`Vizion Gateway SDK initialized in ${config.environment} mode`);
    }
    return VizionGateway.instance;
  }
  
  /**
   * Get the singleton instance of the SDK
   * @throws Error if the SDK has not been initialized
   */
  public static getInstance(): VizionGateway {
    if (!VizionGateway.instance) {
      throw new Error('Vizion Gateway SDK has not been initialized. Call VizionGateway.initialize() first.');
    }
    return VizionGateway.instance;
  }
  
  /**
   * Get the payment service for processing payments
   */
  public getPaymentService(): PaymentService {
    return this.paymentService;
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): VizionGatewayConfig {
    return this.config;
  }
} 