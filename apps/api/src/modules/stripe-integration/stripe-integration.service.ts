import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/services/prisma.service';

@Injectable()
export class StripeIntegrationService {
  private logger = new Logger('StripeIntegrationService');
  private stripeApiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripeApiKey = this.configService.get('STRIPE_API_KEY', '');
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    organizationId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: any,
  ) {
    try {
      const intent = {
        id: `pi_${this.generateId()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: `${this.generateId()}_secret`,
        metadata: {
          organizationId,
          ...metadata,
        },
        created: Math.floor(Date.now() / 1000),
      };

      this.logger.log(`Payment intent created: ${intent.id} for ${amount} ${currency}`);

      // Save to database
      await this.prisma.stripeTransaction.create({
        data: {
          organizationId,
          stripeIntentId: intent.id,
          amount,
          currency,
          status: 'pending',
          metadata: metadata || {},
        },
      });

      return intent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(
    organizationId: string,
    paymentIntentId: string,
    paymentMethodId: string,
  ) {
    try {
      const payment = {
        id: paymentIntentId,
        status: 'succeeded',
        paymentMethodId,
        confirmedAt: new Date().toISOString(),
      };

      // Update database
      await this.prisma.stripeTransaction.update({
        where: { stripeIntentId: paymentIntentId },
        data: {
          status: 'completed',
          paymentMethodId,
          completedAt: new Date(),
        },
      });

      this.logger.log(`Payment confirmed: ${paymentIntentId}`);
      return payment;
    } catch (error) {
      this.logger.error(`Failed to confirm payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(
    organizationId: string,
    customerId: string,
    plan: 'starter' | 'professional' | 'enterprise',
  ) {
    try {
      const planConfig = {
        starter: { price: 29 * 100, name: 'Starter Plan' },
        professional: { price: 99 * 100, name: 'Professional Plan' },
        enterprise: { price: 299 * 100, name: 'Enterprise Plan' },
      };

      const subscription = {
        id: `sub_${this.generateId()}`,
        customerId,
        plan,
        pricePerMonth: planConfig[plan].price / 100,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: this.getSubscriptionFeatures(plan),
      };

      // Save to database
      await this.prisma.stripeSubscription.create({
        data: {
          organizationId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          plan,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      this.logger.log(`Subscription created: ${subscription.id} for ${plan} plan`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(organizationId: string, subscriptionId: string) {
    try {
      await this.prisma.stripeSubscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'canceled',
          canceledAt: new Date(),
        },
      });

      this.logger.log(`Subscription canceled: ${subscriptionId}`);
      return { success: true, message: 'Subscription canceled' };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(event: any) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoiceSuccess(event.data.object);
          break;
      }

      this.logger.log(`Webhook event processed: ${event.type}`);
      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(organizationId: string) {
    try {
      const subscription = await this.prisma.stripeSubscription.findFirst({
        where: { organizationId },
      });

      if (!subscription) {
        return { subscribed: false };
      }

      return {
        subscribed: true,
        plan: subscription.plan,
        status: subscription.status,
        renewalDate: subscription.currentPeriodEnd,
        features: this.getSubscriptionFeatures(subscription.plan),
      };
    } catch (error) {
      this.logger.error(`Failed to get subscription: ${error.message}`);
      throw error;
    }
  }

  private getSubscriptionFeatures(plan: string): string[] {
    const features = {
      starter: [
        'Up to 100 investors',
        'Basic CRM pipeline',
        'Email campaigns',
        'Analytics dashboard',
      ],
      professional: [
        'Up to 1000 investors',
        'Advanced CRM pipeline',
        'Email campaigns',
        'AI-powered matching',
        'Pitch deck analytics',
        'Analytics dashboard',
      ],
      enterprise: [
        'Unlimited investors',
        'Advanced CRM pipeline',
        'Email campaigns',
        'AI-powered matching',
        'Pitch deck analytics',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
      ],
    };

    return features[plan] || [];
  }

  private async handlePaymentSuccess(paymentIntent: any) {
    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
    // Send notification
  }

  private async handlePaymentFailure(paymentIntent: any) {
    this.logger.warn(`Payment failed: ${paymentIntent.id}`);
    // Send notification
  }

  private async handleSubscriptionUpdate(subscription: any) {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Update database
  }

  private async handleInvoiceSuccess(invoice: any) {
    this.logger.log(`Invoice paid: ${invoice.id}`);
    // Update billing records
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
