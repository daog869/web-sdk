# Vizion Gateway Web SDK

A TypeScript SDK for integrating with the Vizion Gateway payment processing platform for web applications, designed specifically for Caribbean businesses.

## Features

- Direct card payment processing
- Transaction management
- Customizable payment form
- Error handling
- TypeScript support
- Modern ES modules

## Installation

### npm

```bash
npm install vizion-gateway-sdk
```

### yarn

```bash
yarn add vizion-gateway-sdk
```

## Quick Start

```javascript
import { VizionGateway, Environment, PaymentForm, Currency } from 'vizion-gateway-sdk';

// Initialize the SDK
VizionGateway.initialize({
  apiKey: 'your_api_key',
  merchantId: 'your_merchant_id',
  environment: Environment.SANDBOX // Use Environment.PRODUCTION for live payments
});

// Create and mount a payment form
const paymentForm = new PaymentForm({
  amount: 99.99,
  currency: Currency.XCD,
  sourceId: 'customer_id',
  destinationId: 'merchant_id',
  orderId: 'order123',
  description: 'Payment for Order #123',
  onSuccess: (response) => {
    console.log('Payment successful!', response);
    alert(`Payment completed! Transaction ID: ${response.transactionId}`);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  },
  onCancel: () => {
    console.log('Payment cancelled');
  },
  styles: {
    baseColor: '#4f46e5',
    errorColor: '#dc2626',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    borderRadius: '8px'
  }
});

// Mount the payment form to a DOM element
paymentForm.mount('payment-form-container');
```

## Direct API Usage

You can also use the SDK directly without the payment form:

```javascript
import { VizionGateway, Environment, Currency } from 'vizion-gateway-sdk';

// Initialize the SDK
const sdk = VizionGateway.initialize({
  apiKey: 'your_api_key',
  merchantId: 'your_merchant_id',
  environment: Environment.SANDBOX
});

// Get the payment service
const paymentService = sdk.getPaymentService();

// Process a card payment
async function processPayment() {
  try {
    const response = await paymentService.processCardPayment({
      amount: 99.99,
      currency: Currency.XCD,
      sourceId: 'customer_id',
      destinationId: 'merchant_id',
      orderId: 'order123',
      description: 'Payment for Order #123',
      card: {
        number: '4242424242424242',
        expiryMonth: '12',
        expiryYear: '25',
        cvc: '123',
        holderName: 'John Doe'
      }
    });
    
    console.log('Payment successful!', response);
    return response;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}

// Get transaction details
async function getTransaction(transactionId) {
  try {
    const transaction = await paymentService.getTransaction(transactionId);
    console.log('Transaction details:', transaction);
    return transaction;
  } catch (error) {
    console.error('Error retrieving transaction:', error);
    throw error;
  }
}

// List transactions
async function listTransactions() {
  try {
    const result = await paymentService.listTransactions({
      limit: 10,
      offset: 0,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    
    console.log(`Retrieved ${result.transactions.length} of ${result.total} transactions`);
    return result;
  } catch (error) {
    console.error('Error listing transactions:', error);
    throw error;
  }
}

// Process a refund
async function processRefund(transactionId, amount, reason) {
  try {
    const response = await paymentService.processRefund(
      transactionId,
      amount, // Optional: refund partial amount
      reason // Optional: reason for refund
    );
    
    console.log('Refund processed successfully!', response);
    return response;
  } catch (error) {
    console.error('Refund failed:', error);
    throw error;
  }
}
```

## Error Handling

The SDK uses custom error types for better error handling:

```javascript
import { VizionGatewayError, ErrorType } from 'vizion-gateway-sdk';

try {
  // SDK operation
} catch (error) {
  if (error instanceof VizionGatewayError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    
    // Handle specific error types
    switch (error.code) {
      case ErrorType.AUTHENTICATION_ERROR:
        console.error('Authentication failed. Check your API key.');
        break;
      case ErrorType.VALIDATION_ERROR:
        console.error('Invalid data provided.');
        break;
      case ErrorType.PAYMENT_PROCESSING_ERROR:
        console.error('Payment processing failed.');
        break;
      default:
        console.error('An unexpected error occurred.');
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Customizing the Payment Form

You can customize the appearance of the payment form:

```javascript
const paymentForm = new PaymentForm({
  // Payment details...
  styles: {
    baseColor: '#4f46e5', // Primary color for buttons and focus states
    errorColor: '#dc2626', // Color for error messages
    fontFamily: 'Roboto, sans-serif',
    fontSize: '16px',
    borderRadius: '8px',
    inputHeight: '50px'
  }
});
```

## Security Considerations

- Never store card details on your servers
- Ensure you're using HTTPS for all payment pages
- Keep your API keys secure and don't expose them in client-side code
- Follow PCI DSS guidelines for handling card data
- Use the sandbox environment for testing

## Browser Support

The SDK supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

For detailed documentation, visit [https://docs.viziongateway.com](https://docs.viziongateway.com)

## Support

Need help? Contact us:
- Email: support@viziongateway.com
- Website: [https://viziongateway.com](https://viziongateway.com)

## License

This SDK is proprietary software. All rights reserved.

© 2024 Vizion Gateway Inc. 