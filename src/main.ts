import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './common/interseptor/exeption.filter';
import { TransformInterceptor } from './transform.interseptor';
import * as requestIp from 'request-ip';

export let app: INestApplication;

async function bootstrap() {
  app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new BadRequestExceptionFilter());
  app.enableCors({
    origin: '*',
  });
  app.use(requestIp.mw());

  await app.listen(5001);
}
bootstrap();
