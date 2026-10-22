import { ConfigService } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

const MIN_SECRET_LENGTH = 32;

// Throwing here aborts the Nest bootstrap: the app never starts with a weak
// or missing secret.
export function jwtModuleOptions(config: ConfigService): JwtModuleOptions {
  const secret = config.getOrThrow<string>('JWT_SECRET');
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
  return {
    secret,
    signOptions: {
      algorithm: 'HS256',
      // Format accepted by jsonwebtoken, e.g. "15m", "1h", "7d".
      expiresIn: config.getOrThrow('JWT_EXPIRES_IN'),
    },
    // Pin the algorithm so a token can't choose its own (e.g. "none").
    verifyOptions: { algorithms: ['HS256'] },
  };
}
