import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

// Injection token for the Stripe client, so tests can swap in a fake one.
export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

// Pinned: the API version shipped with the installed stripe package
// (stripe@23). Bump both together, after reading Stripe's upgrade notes.
const STRIPE_API_VERSION = '2026-09-30.endive';

@Global()
@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Stripe => {
        const key = config.getOrThrow<string>('STRIPE_SECRET_KEY');
        // Test mode only for now. Never echo the key: errors and logs must
        // not carry it, even partially.
        if (!key.startsWith('sk_test_')) {
          throw new Error('STRIPE_SECRET_KEY must be a test key (sk_test_...)');
        }
        return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
      },
    },
  ],
  exports: [STRIPE_CLIENT],
})
export class StripeModule {}
