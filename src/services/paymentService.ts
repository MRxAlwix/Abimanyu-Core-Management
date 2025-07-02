import axios from 'axios';
import { supabase } from '../config/database';
import { notificationService } from './notificationService';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = import.meta.env.VITE_MIDTRANS_SERVER_KEY;
const MIDTRANS_IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';

interface PaymentRequest {
  userId: string;
  subscriptionType: 'monthly' | 'yearly';
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface MidtransResponse {
  token: string;
  redirect_url: string;
  order_id: string;
}

class PaymentService {
  private midtransBaseUrl = MIDTRANS_IS_PRODUCTION 
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  private getSubscriptionAmount(type: 'monthly' | 'yearly'): number {
    return type === 'monthly' ? 29000 : 299000;
  }

  async createPayment(paymentRequest: PaymentRequest): Promise<MidtransResponse> {
    try {
      const orderId = `PREMIUM-${paymentRequest.userId}-${Date.now()}`;
      const amount = this.getSubscriptionAmount(paymentRequest.subscriptionType);

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: paymentRequest.customerDetails.firstName,
          last_name: paymentRequest.customerDetails.lastName,
          email: paymentRequest.customerDetails.email,
          phone: paymentRequest.customerDetails.phone,
        },
        item_details: [
          {
            id: `premium-${paymentRequest.subscriptionType}`,
            price: amount,
            quantity: 1,
            name: `Abimanyu Premium ${paymentRequest.subscriptionType === 'monthly' ? 'Bulanan' : 'Tahunan'}`,
            category: 'Subscription',
          },
        ],
        callbacks: {
          finish: `${window.location.origin}/payment/success`,
          error: `${window.location.origin}/payment/error`,
          pending: `${window.location.origin}/payment/pending`,
        },
      };

      // Create payment token via Midtrans
      const response = await axios.post(
        this.midtransBaseUrl,
        parameter,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(MIDTRANS_SERVER_KEY + ':')}`,
          },
        }
      );

      // Store pending subscription in database
      await supabase.from('premium_subscriptions').insert({
        user_id: paymentRequest.userId,
        subscription_type: paymentRequest.subscriptionType,
        amount,
        currency: 'IDR',
        status: 'pending',
        started_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + (paymentRequest.subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString(),
        midtrans_order_id: orderId,
      });

      return {
        token: response.data.token,
        redirect_url: response.data.redirect_url,
        order_id: orderId,
      };
    } catch (error: any) {
      console.error('Payment creation error:', error);
      throw new Error('Gagal membuat pembayaran');
    }
  }

  async handlePaymentCallback(orderId: string, transactionStatus: string, transactionId: string): Promise<void> {
    try {
      let status: 'active' | 'cancelled' | 'expired' = 'cancelled';

      if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
        status = 'active';
      } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        status = 'cancelled';
      }

      // Update subscription status
      const { data: subscription, error: updateError } = await supabase
        .from('premium_subscriptions')
        .update({
          status,
          midtrans_transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('midtrans_order_id', orderId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // If payment successful, update user premium status
      if (status === 'active' && subscription) {
        await supabase
          .from('users')
          .update({
            is_premium: true,
            premium_until: subscription.expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.user_id);

        notificationService.success('Pembayaran berhasil! Akun Premium Anda telah aktif.');
      } else {
        notificationService.error('Pembayaran gagal atau dibatalkan.');
      }
    } catch (error: any) {
      console.error('Payment callback error:', error);
      notificationService.error('Gagal memproses callback pembayaran');
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<{
    isPremium: boolean;
    expiresAt?: string;
    subscriptionType?: string;
  }> {
    try {
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (!subscription) {
        return { isPremium: false };
      }

      const isExpired = new Date(subscription.expires_at) < new Date();
      
      if (isExpired) {
        // Update expired subscription
        await supabase
          .from('premium_subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);

        await supabase
          .from('users')
          .update({ is_premium: false, premium_until: null })
          .eq('id', userId);

        return { isPremium: false };
      }

      return {
        isPremium: true,
        expiresAt: subscription.expires_at,
        subscriptionType: subscription.subscription_type,
      };
    } catch (error) {
      console.error('Subscription check error:', error);
      return { isPremium: false };
    }
  }

  loadMidtransScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.snap) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = MIDTRANS_IS_PRODUCTION
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Midtrans script'));
      document.head.appendChild(script);
    });
  }

  async openPaymentModal(token: string): Promise<void> {
    try {
      await this.loadMidtransScript();
      
      window.snap.pay(token, {
        onSuccess: (result: any) => {
          this.handlePaymentCallback(result.order_id, result.transaction_status, result.transaction_id);
        },
        onPending: (result: any) => {
          notificationService.info('Pembayaran pending. Silakan selesaikan pembayaran Anda.');
        },
        onError: (result: any) => {
          notificationService.error('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: () => {
          notificationService.warning('Pembayaran dibatalkan.');
        },
      });
    } catch (error) {
      console.error('Payment modal error:', error);
      notificationService.error('Gagal membuka modal pembayaran');
    }
  }
}

export const paymentService = new PaymentService();

// Extend window object for Midtrans
declare global {
  interface Window {
    snap: any;
  }
}