import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LoggerService } from './logger.service';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, any>;
}

export interface CreateCustomerDto {
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new LoggerService();

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(secretKey);
  }

  async createCustomer(dto: CreateCustomerDto): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: dto.email,
        name: dto.name,
        metadata: dto.metadata,
      });

      this.logger.log(`Created Stripe customer: ${customer.id}`, {
        operation: 'createCustomer',
        metadata: { customerId: customer.id, email: dto.email },
      });

      return customer;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer: ${error.message}`, error.stack, {
        operation: 'createCustomer',
        metadata: { email: dto.email },
      });
      throw error;
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: dto.currency,
        customer: dto.customerId,
        metadata: dto.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Created payment intent: ${paymentIntent.id}`, {
        operation: 'createPaymentIntent',
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: dto.amount,
          currency: dto.currency,
        },
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack, {
        operation: 'createPaymentIntent',
        metadata: { amount: dto.amount, currency: dto.currency },
      });
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      this.logger.log(`Retrieved payment intent: ${paymentIntentId}`, {
        operation: 'retrievePaymentIntent',
        metadata: { paymentIntentId },
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent: ${error.message}`, error.stack, {
        operation: 'retrievePaymentIntent',
        metadata: { paymentIntentId },
      });
      throw error;
    }
  }

  async createWebhookEndpoint(url: string, events: string[]): Promise<Stripe.WebhookEndpoint> {
    try {
      const webhookEndpoint = await this.stripe.webhookEndpoints.create({
        url,
        enabled_events: events as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      });

      this.logger.log(`Created webhook endpoint: ${webhookEndpoint.id}`, {
        operation: 'createWebhookEndpoint',
        metadata: { webhookId: webhookEndpoint.id, url },
      });

      return webhookEndpoint;
    } catch (error) {
      this.logger.error(`Failed to create webhook endpoint: ${error.message}`, error.stack, {
        operation: 'createWebhookEndpoint',
        metadata: { url },
      });
      throw error;
    }
  }

  constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
