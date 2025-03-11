import { VizionGateway } from '../vizion-gateway';
import { Currency, PaymentRequest, PaymentResponse } from '../models/payment';
import { VizionGatewayError, ErrorType } from '../utils/errors';

/**
 * Configuration options for the payment form
 */
export interface PaymentFormConfig {
  amount: number;
  currency: Currency;
  sourceId: string;
  destinationId: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, any>;
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: VizionGatewayError) => void;
  onCancel?: () => void;
  styles?: {
    baseColor?: string;
    errorColor?: string;
    fontFamily?: string;
    fontSize?: string;
    borderRadius?: string;
    inputHeight?: string;
  };
}

/**
 * A customizable payment form component that can be embedded in web applications
 */
export class PaymentForm {
  private config: PaymentFormConfig;
  private formElement: HTMLFormElement | null = null;
  private formContainer: HTMLDivElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private sdk: VizionGateway;
  
  /**
   * Create a new payment form
   * @param config Configuration options for the payment form
   */
  constructor(config: PaymentFormConfig) {
    this.config = config;
    
    try {
      this.sdk = VizionGateway.getInstance();
    } catch (error) {
      throw new VizionGatewayError(
        'SDK not initialized. Call VizionGateway.initialize() before creating a PaymentForm.',
        ErrorType.CONFIGURATION_ERROR,
        400
      );
    }
  }
  
  /**
   * Mount the payment form to a DOM element
   * @param elementId ID of the DOM element to mount the form to
   */
  public mount(elementId: string): void {
    const container = document.getElementById(elementId);
    
    if (!container) {
      throw new VizionGatewayError(
        `Element with ID "${elementId}" not found.`,
        ErrorType.CONFIGURATION_ERROR,
        400
      );
    }
    
    // Create form container
    this.formContainer = document.createElement('div');
    this.formContainer.className = 'vizion-gateway-payment-form';
    this.formContainer.style.fontFamily = this.config.styles?.fontFamily || 'Arial, sans-serif';
    this.formContainer.style.fontSize = this.config.styles?.fontSize || '16px';
    
    // Create form
    this.formElement = document.createElement('form');
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Create form fields
    this.createFormFields();
    
    // Append form to container
    this.formContainer.appendChild(this.formElement);
    
    // Add styles
    this.addStyles();
    
    // Append to DOM
    container.appendChild(this.formContainer);
  }
  
  /**
   * Unmount the payment form
   */
  public unmount(): void {
    if (this.formContainer && this.formContainer.parentNode) {
      this.formContainer.parentNode.removeChild(this.formContainer);
      this.formContainer = null;
      this.formElement = null;
      this.submitButton = null;
    }
  }
  
  /**
   * Create the form fields
   */
  private createFormFields(): void {
    if (!this.formElement) return;
    
    // Card number field
    const cardNumberGroup = this.createFormGroup('Card Number');
    const cardNumberInput = document.createElement('input');
    cardNumberInput.type = 'text';
    cardNumberInput.id = 'vizion-card-number';
    cardNumberInput.placeholder = '•••• •••• •••• ••••';
    cardNumberInput.autocomplete = 'cc-number';
    cardNumberInput.required = true;
    cardNumberInput.maxLength = 19; // 16 digits + 3 spaces
    cardNumberInput.addEventListener('input', this.formatCardNumber.bind(this));
    cardNumberGroup.appendChild(cardNumberInput);
    this.formElement.appendChild(cardNumberGroup);
    
    // Expiry date and CVC in a row
    const row = document.createElement('div');
    row.className = 'vizion-form-row';
    row.style.display = 'flex';
    row.style.gap = '10px';
    
    // Expiry date field
    const expiryGroup = this.createFormGroup('Expiry Date');
    const expiryInput = document.createElement('input');
    expiryInput.type = 'text';
    expiryInput.id = 'vizion-expiry';
    expiryInput.placeholder = 'MM / YY';
    expiryInput.autocomplete = 'cc-exp';
    expiryInput.required = true;
    expiryInput.maxLength = 7; // MM / YY
    expiryInput.addEventListener('input', this.formatExpiry.bind(this));
    expiryGroup.appendChild(expiryInput);
    row.appendChild(expiryGroup);
    
    // CVC field
    const cvcGroup = this.createFormGroup('CVC');
    const cvcInput = document.createElement('input');
    cvcInput.type = 'text';
    cvcInput.id = 'vizion-cvc';
    cvcInput.placeholder = '•••';
    cvcInput.autocomplete = 'cc-csc';
    cvcInput.required = true;
    cvcInput.maxLength = 4;
    cvcInput.addEventListener('input', this.formatCVC.bind(this));
    cvcGroup.appendChild(cvcInput);
    row.appendChild(cvcGroup);
    
    this.formElement.appendChild(row);
    
    // Cardholder name field
    const nameGroup = this.createFormGroup('Cardholder Name');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'vizion-cardholder-name';
    nameInput.placeholder = 'Name on card';
    nameInput.autocomplete = 'cc-name';
    nameInput.required = true;
    nameGroup.appendChild(nameInput);
    this.formElement.appendChild(nameGroup);
    
    // Submit button
    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className = 'vizion-submit-button';
    this.submitButton.textContent = `Pay ${this.formatAmount(this.config.amount, this.config.currency)}`;
    this.formElement.appendChild(this.submitButton);
    
    // Cancel link
    if (this.config.onCancel) {
      const cancelLink = document.createElement('a');
      cancelLink.href = '#';
      cancelLink.className = 'vizion-cancel-link';
      cancelLink.textContent = 'Cancel';
      cancelLink.style.display = 'block';
      cancelLink.style.textAlign = 'center';
      cancelLink.style.marginTop = '10px';
      cancelLink.style.color = '#666';
      cancelLink.style.textDecoration = 'none';
      cancelLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.config.onCancel) this.config.onCancel();
      });
      this.formElement.appendChild(cancelLink);
    }
  }
  
  /**
   * Create a form group with label
   * @param labelText The label text
   * @returns Form group element
   */
  private createFormGroup(labelText: string): HTMLDivElement {
    const group = document.createElement('div');
    group.className = 'vizion-form-group';
    group.style.marginBottom = '15px';
    
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    label.style.fontWeight = 'bold';
    
    group.appendChild(label);
    return group;
  }
  
  /**
   * Add styles to the form
   */
  private addStyles(): void {
    if (!this.formContainer) return;
    
    const baseColor = this.config.styles?.baseColor || '#4f46e5';
    const errorColor = this.config.styles?.errorColor || '#dc2626';
    const borderRadius = this.config.styles?.borderRadius || '4px';
    const inputHeight = this.config.styles?.inputHeight || '40px';
    
    // Style all inputs
    const inputs = this.formContainer.querySelectorAll('input');
    inputs.forEach((input) => {
      input.style.width = '100%';
      input.style.padding = '8px 12px';
      input.style.borderRadius = borderRadius;
      input.style.border = '1px solid #d1d5db';
      input.style.height = inputHeight;
      input.style.boxSizing = 'border-box';
      input.style.fontSize = this.config.styles?.fontSize || '16px';
      
      // Focus styles
      input.addEventListener('focus', () => {
        input.style.outline = 'none';
        input.style.borderColor = baseColor;
        input.style.boxShadow = `0 0 0 1px ${baseColor}`;
      });
      
      input.addEventListener('blur', () => {
        input.style.boxShadow = 'none';
      });
    });
    
    // Style submit button
    if (this.submitButton) {
      this.submitButton.style.width = '100%';
      this.submitButton.style.backgroundColor = baseColor;
      this.submitButton.style.color = 'white';
      this.submitButton.style.border = 'none';
      this.submitButton.style.borderRadius = borderRadius;
      this.submitButton.style.padding = '10px 16px';
      this.submitButton.style.fontSize = this.config.styles?.fontSize || '16px';
      this.submitButton.style.fontWeight = 'bold';
      this.submitButton.style.cursor = 'pointer';
      this.submitButton.style.height = inputHeight;
      this.submitButton.style.marginTop = '20px';
      
      // Hover and active states
      this.submitButton.addEventListener('mouseover', () => {
        this.submitButton!.style.backgroundColor = this.adjustColor(baseColor, -20);
      });
      
      this.submitButton.addEventListener('mouseout', () => {
        this.submitButton!.style.backgroundColor = baseColor;
      });
    }
  }
  
  /**
   * Format card number with spaces
   * @param event Input event
   */
  private formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Add spaces after every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || '';
    }
    
    input.value = value;
  }
  
  /**
   * Format expiry date as MM / YY
   * @param event Input event
   */
  private formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 2) {
        input.value = value;
      } else {
        input.value = `${value.substring(0, 2)} / ${value.substring(2, 4)}`;
      }
    }
  }
  
  /**
   * Format CVC to only allow digits
   * @param event Input event
   */
  private formatCVC(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
  }
  
  /**
   * Handle form submission
   * @param event Submit event
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.formElement || !this.submitButton) return;
    
    // Disable submit button
    this.submitButton.disabled = true;
    this.submitButton.textContent = 'Processing...';
    
    try {
      // Get form values
      const cardNumber = (document.getElementById('vizion-card-number') as HTMLInputElement).value.replace(/\s/g, '');
      const expiry = (document.getElementById('vizion-expiry') as HTMLInputElement).value;
      const cvc = (document.getElementById('vizion-cvc') as HTMLInputElement).value;
      const holderName = (document.getElementById('vizion-cardholder-name') as HTMLInputElement).value;
      
      // Parse expiry
      const [expiryMonth, expiryYear] = this.parseExpiry(expiry);
      
      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount: this.config.amount,
        currency: this.config.currency,
        sourceId: this.config.sourceId,
        destinationId: this.config.destinationId,
        orderId: this.config.orderId,
        description: this.config.description,
        metadata: this.config.metadata,
        card: {
          number: cardNumber,
          expiryMonth,
          expiryYear,
          cvc,
          holderName
        }
      };
      
      // Process payment
      const response = await this.sdk.getPaymentService().processCardPayment(paymentRequest);
      
      // Handle success
      if (this.config.onSuccess) {
        this.config.onSuccess(response);
      }
      
      // Reset form
      this.formElement.reset();
      
    } catch (error) {
      // Handle error
      if (this.config.onError) {
        if (error instanceof VizionGatewayError) {
          this.config.onError(error);
        } else {
          this.config.onError(new VizionGatewayError(
            (error as Error).message || 'An unknown error occurred',
            ErrorType.UNKNOWN_ERROR,
            500
          ));
        }
      }
      
      // Show error in form
      this.showError((error as Error).message);
    } finally {
      // Re-enable submit button
      this.submitButton.disabled = false;
      this.submitButton.textContent = `Pay ${this.formatAmount(this.config.amount, this.config.currency)}`;
    }
  }
  
  /**
   * Parse expiry string into month and year
   * @param expiry Expiry string in format "MM / YY"
   * @returns [month, year]
   */
  private parseExpiry(expiry: string): [string, string] {
    const parts = expiry.split('/').map(part => part.trim());
    const month = parts[0] || '';
    const year = parts[1] || '';
    
    return [month, year];
  }
  
  /**
   * Show error message in the form
   * @param message Error message
   */
  private showError(message: string): void {
    if (!this.formContainer) return;
    
    // Remove any existing error
    const existingError = this.formContainer.querySelector('.vizion-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'vizion-error-message';
    errorElement.textContent = message;
    errorElement.style.color = this.config.styles?.errorColor || '#dc2626';
    errorElement.style.marginTop = '10px';
    errorElement.style.marginBottom = '10px';
    errorElement.style.padding = '8px 12px';
    errorElement.style.backgroundColor = '#fee2e2';
    errorElement.style.borderRadius = this.config.styles?.borderRadius || '4px';
    errorElement.style.border = '1px solid #fecaca';
    
    // Insert at the top of the form
    this.formElement?.insertBefore(errorElement, this.formElement.firstChild);
  }
  
  /**
   * Format amount with currency symbol
   * @param amount Amount to format
   * @param currency Currency
   * @returns Formatted amount
   */
  private formatAmount(amount: number, currency: Currency): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    
    return formatter.format(amount);
  }
  
  /**
   * Adjust color brightness
   * @param color Color in hex format
   * @param percent Percentage to adjust
   * @returns Adjusted color
   */
  private adjustColor(color: string, percent: number): string {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Adjust
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
} 