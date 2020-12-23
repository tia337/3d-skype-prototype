import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: false,
    origin: ['https://localhost:4200', 'http://localhost:4200', 'localhost' ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  useContainer(app, { fallbackOnErrors: true });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
