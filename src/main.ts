import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common';
import helmet from "helmet"




async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // protects from basic attacks like clickjacking
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true
    })
  )


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  const config = new DocumentBuilder()
  .setTitle('RideFlow API')
  .setDescription('Ride sharing backend APIs')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

