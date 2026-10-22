import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../stripe/stripe.module';
import { SubscriptionSyncService } from './subscription-sync.service';

const SUBSCRIPTION_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

// A failed payment moves the subscription to past_due on Stripe's side
// (a successful one, back to active): both are handled by re-reading it.
const INVOICE_EVENTS = new Set(['invoice.payment_failed', 'invoice.paid']);

// Public on purpose (Stripe calls it): the signature is the authentication.
// No JWT guard, no tenant context.
@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private readonly webhookSecret: string;

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly subscriptionSync: SubscriptionSyncService,
    config: ConfigService,
  ) {
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    // The signature covers the exact bytes Stripe sent: needs rawBody: true
    // on the Nest app (main.ts), not a re-serialized req.body.
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.webhookSecret,
      );
    } catch {
      // Stripe's message is not echoed: a caller learns nothing about why.
      throw new BadRequestException('Invalid Stripe signature');
    }

    const subscriptionId = subscriptionIdOf(event);
    if (!subscriptionId) {
      // Unhandled type (or an invoice without subscription): acknowledged so
      // Stripe does not retry it.
      return { received: true };
    }
    const result = await this.subscriptionSync.sync(subscriptionId);
    this.logger.log(
      `Stripe event ${event.id} (${event.type}): ${result.outcome}`,
    );
    return { received: true };
  }
}

// Which subscription an event is about, for the events we handle. Only the id
// is used: its state is re-read from Stripe, never taken from the payload.
function subscriptionIdOf(event: Stripe.Event): string | undefined {
  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    return (event.data.object as Stripe.Subscription).id;
  }
  if (INVOICE_EVENTS.has(event.type)) {
    const invoice = event.data.object as Stripe.Invoice;
    const subscription = invoice.parent?.subscription_details?.subscription;
    return typeof subscription === 'string' ? subscription : subscription?.id;
  }
  return undefined;
}
