import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from our Next.js frontend
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // Start backend on port 4000
  await app.listen(4000);

  console.log('Backend running at http://localhost:4000');
}

bootstrap();