import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from "process";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "./pipe/validation.pipe";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule,{ cors: true });

  const config = new DocumentBuilder()
      .setTitle('Api for chat with authorization')
      .setDescription('Endpoints for chat')
      .setVersion('1.0.0')
      .addTag('lationes')
      .build();

  app.use(cookieParser());

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
}

bootstrap();
