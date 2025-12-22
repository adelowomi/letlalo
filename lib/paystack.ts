import { PaystackConfig, PaystackResponse } from './types';

interface PaystackSetupConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: PaystackSetupConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export const initializePaystack = (config: PaystackConfig) => {
  if (!window.PaystackPop) {
    console.error('Paystack library not loaded');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo
    currency: config.currency || 'NGN',
    ref: config.ref || `${Date.now()}`,
    metadata: config.metadata,
    callback: (response: PaystackResponse) => {
      if (config.onSuccess) {
        config.onSuccess(response);
      }
    },
    onClose: () => {
      if (config.onClose) {
        config.onClose();
      }
    },
  });

  handler.openIframe();
};

export const generatePaystackReference = (): string => {
  return `LTL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const formatCurrency = (amount: number, currency = 'NGN'): string => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
