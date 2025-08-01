interface BkashConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
}

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashPaymentRequest {
  mode: '0011' | '0001'; // 0011 for checkout, 0001 for payment
  payerReference: string;
  callbackURL: string;
  amount: string;
  currency: 'BDT';
  intent: 'sale';
  merchantInvoiceNumber: string;
}

interface BkashPaymentResponse {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

interface BkashExecuteResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: 'Completed' | 'Failed' | 'Cancelled';
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerReference: string;
}

class BkashService {
  private config: BkashConfig;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      baseUrl: process.env.BKASH_BASE_URL || '',
      appKey: process.env.BKASH_APP_KEY || '',
      appSecret: process.env.BKASH_APP_SECRET || '',
      username: process.env.BKASH_USERNAME || '',
      password: process.env.BKASH_PASSWORD || ''
    };
  }

  private async getToken(): Promise<string> {
    // Check if token is still valid
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': this.config.username,
          'password': this.config.password
        },
        body: JSON.stringify({
          app_key: this.config.appKey,
          app_secret: this.config.appSecret
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get bKash token: ${response.statusText}`);
      }

      const data: BkashTokenResponse = await response.json();
      this.token = data.id_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return this.token;
    } catch (error) {
      console.error('bKash token error:', error);
      throw new Error('Failed to authenticate with bKash');
    }
  }

  async createPayment(paymentData: {
    amount: number;
    orderNumber: string;
    customerPhone: string;
  }): Promise<BkashPaymentResponse> {
    try {
      const token = await this.getToken();

      const paymentRequest: BkashPaymentRequest = {
        mode: '0011', // Checkout mode
        payerReference: paymentData.customerPhone,
        callbackURL: `${process.env.BKASH_WEBHOOK_URL}`,
        amount: paymentData.amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: paymentData.orderNumber
      };

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': this.config.appKey
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('bKash create payment error:', errorData);
        throw new Error(`Failed to create bKash payment: ${response.statusText}`);
      }

      const paymentResponse: BkashPaymentResponse = await response.json();
      return paymentResponse;
    } catch (error) {
      console.error('Create payment error:', error);
      throw error;
    }
  }

  async executePayment(paymentId: string): Promise<BkashExecuteResponse> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': this.config.appKey
        },
        body: JSON.stringify({
          paymentID: paymentId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('bKash execute payment error:', errorData);
        throw new Error(`Failed to execute bKash payment: ${response.statusText}`);
      }

      const executeResponse: BkashExecuteResponse = await response.json();
      return executeResponse;
    } catch (error) {
      console.error('Execute payment error:', error);
      throw error;
    }
  }

  async queryPayment(paymentId: string): Promise<BkashExecuteResponse> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': this.config.appKey
        },
        body: JSON.stringify({
          paymentID: paymentId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('bKash query payment error:', errorData);
        throw new Error(`Failed to query bKash payment: ${response.statusText}`);
      }

      const queryResponse: BkashExecuteResponse = await response.json();
      return queryResponse;
    } catch (error) {
      console.error('Query payment error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount: number, trxId: string, reason: string): Promise<{ refundTrxID: string; transactionStatus: string; amount: string }> {
    try {
      const token = await this.getToken();

      const response = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': this.config.appKey
        },
        body: JSON.stringify({
          paymentID: paymentId,
          amount: amount.toFixed(2),
          trxID: trxId,
          sku: 'product',
          reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('bKash refund payment error:', errorData);
        throw new Error(`Failed to refund bKash payment: ${response.statusText}`);
      }

      const refundResponse = await response.json();
      return refundResponse;
    } catch (error) {
      console.error('Refund payment error:', error);
      throw error;
    }
  }
}

const bkashService = new BkashService();
export default bkashService;
export type { BkashPaymentResponse, BkashExecuteResponse };
