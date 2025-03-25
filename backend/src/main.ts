import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Setup validasi global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Setup CORS
  app.enableCors();
  
  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Laundry API')
    .setDescription('API untuk sistem manajemen laundry')
    .setVersion('1.0')
    .addTag('laundry')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Debug DB Connection
  console.log('Database Connection Info:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  console.log(`Username: ${process.env.DB_USERNAME}`);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap(); 