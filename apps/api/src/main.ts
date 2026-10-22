import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody keeps the exact request bytes on req.rawBody (Stripe webhook
  // signatures are computed over them) while JSON is still parsed as usual.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
