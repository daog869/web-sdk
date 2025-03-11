import { PaymentFormOptions, TransactionResult, CardPaymentDetails } from './types';
import { VizionGatewayClient } from './client';
import { VizionGatewayError, ErrorType } from './errors';
import { validateCardNumber, detectCardType, formatAmount } from './utils';

/**
 * Payment form component for collecting and processing card payments
 */
export class PaymentForm {
  private client: VizionGatewayClient;
  private options: PaymentFormOptions;
  private formElement: HTMLFormElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private errorElement: HTMLDivElement | null = null;
  private formFields: Record<string, HTMLInputElement> = {};
  private container: HTMLElement;
  private isSubmitting = false;

  /**
   * Creates a new payment form
   * @param client VizionGatewayClient instance
   * @param options Configuration options
   */
  constructor(client: VizionGatewayClient, options: PaymentFormOptions) {
    this.client = client;
    this.options = options;

    // Get container element
    const container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    if (!container) {
      throw new VizionGatewayError(
        `Container element not found: ${options.container}`,
        ErrorType.VALIDATION
      );
    }

    this.container = container as HTMLElement;
    this.render();
  }

  /**
   * Renders the payment form in the container
   */
  private render(): void {
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.className = 'vizion-gateway-payment-form';
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));

    // Add header with amount
    const header = document.createElement('div');
    header.className = 'vizion-gateway-form-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Payment Details';
    header.appendChild(title);
    
    const amount = document.createElement('div');
    amount.className = 'vizion-gateway-amount';
    amount.textContent = formatAmount(this.options.amount, this.options.currency);
    header.appendChild(amount);
    
    this.formElement.appendChild(header);

    // Create error element
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'vizion-gateway-error';
    this.errorElement.style.display = 'none';
    this.formElement.appendChild(this.errorElement);

    // Create form fields
    this.createFormField('cardholderName', 'Cardholder Name', 'text', { required: true });
    this.createFormField('cardNumber', 'Card Number', 'text', { 
      required: true,
      pattern: '[0-9\\s]{13,19}',
      maxLength: '19',
      autocomplete: 'cc-number'
    });
    
    // Create expiry date fields
    const expiryGroup = document.createElement('div');
    expiryGroup.className = 'vizion-gateway-form-group expiry-group';
    
    this.createFormField('expiryMonth', 'Month (MM)', 'text', {
      required: true,
      pattern: '[0-9]{1,2}',
      maxLength: '2',
      placeholder: 'MM',
      autocomplete: 'cc-exp-month'
    }, expiryGroup);
    
    this.createFormField('expiryYear', 'Year (YYYY)', 'text', {
      required: true,
      pattern: '[0-9]{4}',
      maxLength: '4',
      placeholder: 'YYYY',
      autocomplete: 'cc-exp-year'
    }, expiryGroup);
    
    this.formElement.appendChild(expiryGroup);
    
    this.createFormField('cvv', 'CVV', 'text', {
      required: true,
      pattern: '[0-9]{3,4}',
      maxLength: '4',
      autocomplete: 'cc-csc'
    });

    // Create submit button
    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className = 'vizion-gateway-submit-button';
    this.submitButton.textContent = 'Pay Now';
    this.formElement.appendChild(this.submitButton);

    // Add event listeners for validation and card type detection
    const cardNumberInput = this.formFields.cardNumber;
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', this.handleCardNumberInput.bind(this));
      cardNumberInput.addEventListener('blur', this.validateCardNumber.bind(this));
    }

    // Apply custom styles
    this.applyStyles();

    // Add form to container
    this.container.innerHTML = '';
    this.container.appendChild(this.formElement);

    // Add necessary styles
    this.addFormStyles();
  }

  /**
   * Creates a form field and adds it to the form
   */
  private createFormField(
    name: string,
    label: string,
    type: string,
    attributes: Record<string, string | boolean> = {},
    parent?: HTMLElement
  ): void {
    const group = document.createElement('div');
    group.className = `vizion-gateway-form-group ${name}-group`;

    const labelElement = document.createElement('label');
    labelElement.htmlFor = `vizion-gateway-${name}`;
    labelElement.textContent = label;
    group.appendChild(labelElement);

    const input = document.createElement('input');
    input.type = type;
    input.id = `vizion-gateway-${name}`;
    input.name = name;
    
    // Add attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'boolean') {
        if (value) {
          input.setAttribute(key, '');
        }
      } else {
        input.setAttribute(key, value);
      }
    }

    group.appendChild(input);
    
    // Store reference to input
    this.formFields[name] = input;
    
    // Add to parent (form or custom parent)
    const targetParent = parent || this.formElement;
    if (targetParent) {
      targetParent.appendChild(group);
    }
  }

  /**
   * Handles card number input for formatting and validation
   */
  private handleCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Add spaces for readability (format: XXXX XXXX XXXX XXXX)
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }
    
    input.value = value;
    
    // Update card type indicator if available
    const cardType = detectCardType(value);
    if (cardType) {
      const cardField = this.formFields.cardNumber.parentElement;
      if (cardField) {
        cardField.setAttribute('data-card-type', cardType);
      }
    }
  }

  /**
   * Validates the card number using Luhn algorithm
   */
  private validateCardNumber(): void {
    const cardNumberInput = this.formFields.cardNumber;
    const value = cardNumberInput.value.replace(/\s/g, '');
    
    if (value && !validateCardNumber(value)) {
      cardNumberInput.setCustomValidity('Invalid card number');
    } else {
      cardNumberInput.setCustomValidity('');
    }
  }

  /**
   * Handles form submission
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (this.isSubmitting) {
      return;
    }
    
    this.clearError();
    
    // Validate form
    if (!this.formElement?.checkValidity()) {
      this.formElement?.reportValidity();
      return;
    }
    
    // Show loading state
    this.isSubmitting = true;
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Processing...';
    }
    
    try {
      // Get form values
      const cardDetails: CardPaymentDetails = {
        cardNumber: this.formFields.cardNumber.value.replace(/\s/g, ''),
        expiryMonth: parseInt(this.formFields.expiryMonth.value, 10),
        expiryYear: parseInt(this.formFields.expiryYear.value, 10),
        cvv: this.formFields.cvv.value,
        cardholderName: this.formFields.cardholderName.value
      };
      
      // Process payment
      const result = await this.client.processCardPayment({
        amount: this.options.amount,
        currency: this.options.currency,
        sourceId: this.options.sourceId,
        destinationId: this.options.destinationId,
        orderId: this.options.orderId,
        description: this.options.description
      }, cardDetails);
      
      // Call success callback
      if (this.options.onSuccess) {
        this.options.onSuccess(result);
      }
      
      // Clear form
      this.formElement?.reset();
      
    } catch (error) {
      this.showError(error);
      
      // Call error callback
      if (this.options.onError) {
        this.options.onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      // Reset submission state
      this.isSubmitting = false;
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Pay Now';
      }
    }
  }

  /**
   * Shows an error message in the form
   */
  private showError(error: any): void {
    if (!this.errorElement) {
      return;
    }
    
    const message = error instanceof VizionGatewayError
      ? error.message
      : 'An error occurred while processing your payment';
    
    this.errorElement.textContent = message;
    this.errorElement.style.display = 'block';
  }

  /**
   * Clears any displayed error message
   */
  private clearError(): void {
    if (this.errorElement) {
      this.errorElement.textContent = '';
      this.errorElement.style.display = 'none';
    }
  }

  /**
   * Applies custom styles to the form
   */
  private applyStyles(): void {
    const { styles } = this.options;
    
    if (!styles) {
      return;
    }
    
    // Apply base styles
    if (styles.base && this.formElement) {
      for (const [prop, value] of Object.entries(styles.base)) {
        this.formElement.style.setProperty(`--vizion-gateway-${prop}`, value);
      }
    }
    
    // Apply field-specific styles
    if (styles.fields) {
      for (const [field, fieldStyles] of Object.entries(styles.fields)) {
        const inputElement = this.formFields[field];
        if (inputElement) {
          for (const [prop, value] of Object.entries(fieldStyles)) {
            if (typeof value === 'string') {
              inputElement.style.setProperty(`--vizion-gateway-field-${prop}`, value);
            }
          }
        }
      }
    }
    
    // Apply button styles
    if (styles.button && this.submitButton) {
      for (const [prop, value] of Object.entries(styles.button)) {
        this.submitButton.style.setProperty(`--vizion-gateway-button-${prop}`, value);
      }
    }
  }

  /**
   * Adds required CSS styles to the document
   */
  private addFormStyles(): void {
    // Check if styles are already added
    if (document.getElementById('vizion-gateway-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'vizion-gateway-styles';
    
    styleElement.textContent = `
      .vizion-gateway-payment-form {
        font-family: var(--vizion-gateway-fontFamily, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background-color: #fff;
      }
      
      .vizion-gateway-form-header {
        margin-bottom: 20px;
        text-align: center;
      }
      
      .vizion-gateway-form-header h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #333;
      }
      
      .vizion-gateway-amount {
        font-size: 24px;
        font-weight: bold;
        color: #2a2a2a;
      }
      
      .vizion-gateway-error {
        padding: 10px;
        margin-bottom: 15px;
        background-color: #ffe6e6;
        border-left: 4px solid #ff5252;
        color: #d32f2f;
        border-radius: 4px;
      }
      
      .vizion-gateway-form-group {
        margin-bottom: 16px;
      }
      
      .vizion-gateway-form-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: 500;
        color: #555;
      }
      
      .vizion-gateway-form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 16px;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }
      
      .vizion-gateway-form-group input:focus {
        outline: none;
        border-color: #4a90e2;
      }
      
      .vizion-gateway-form-group input:invalid {
        border-color: #ff5252;
      }
      
      .expiry-group {
        display: flex;
        gap: 12px;
      }
      
      .expiry-group > div {
        flex: 1;
      }
      
      .vizion-gateway-submit-button {
        display: block;
        width: 100%;
        padding: 12px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .vizion-gateway-submit-button:hover {
        background-color: #3a7bc8;
      }
      
      .vizion-gateway-submit-button:disabled {
        background-color: #b3b3b3;
        cursor: not-allowed;
      }
      
      /* Card type indicators */
      [data-card-type="visa"]::after {
        content: "Visa";
        position: absolute;
        right: 10px;
        top: 32px;
        font-size: 12px;
        color: #666;
      }
      
      [data-card-type="mastercard"]::after {
        content: "Mastercard";
        position: absolute;
        right: 10px;
        top: 32px;
        font-size: 12px;
        color: #666;
      }
      
      [data-card-type="amex"]::after {
        content: "Amex";
        position: absolute;
        right: 10px;
        top: 32px;
        font-size: 12px;
        color: #666;
      }
      
      /* Responsive styles */
      @media (max-width: 480px) {
        .vizion-gateway-payment-form {
          padding: 15px;
          box-shadow: none;
          border: 1px solid #e0e0e0;
        }
        
        .vizion-gateway-form-group input {
          font-size: 14px;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  /**
   * Destroys the payment form and removes it from the DOM
   */
  public destroy(): void {
    if (this.formElement) {
      this.formElement.removeEventListener('submit', this.handleSubmit.bind(this));
      
      // Remove card number input event listeners
      const cardNumberInput = this.formFields.cardNumber;
      if (cardNumberInput) {
        cardNumberInput.removeEventListener('input', this.handleCardNumberInput.bind(this));
        cardNumberInput.removeEventListener('blur', this.validateCardNumber.bind(this));
      }
      
      // Remove form from container
      if (this.container.contains(this.formElement)) {
        this.container.removeChild(this.formElement);
      }
      
      this.formElement = null;
      this.submitButton = null;
      this.errorElement = null;
      this.formFields = {};
    }
  }
} 