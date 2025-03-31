import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { CompressionInterceptor } from './interceptors/compression.interceptor';
import { HelmetInterceptor } from './interceptors/helmet.interceptor';
import { CorsInterceptor } from './interceptors/cors.interceptor';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import * as cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Use cookie-parser middleware globally
  app.use(cookieParser());
  
  // Setup validasi global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    disableErrorMessages: false,
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return constraints.length ? constraints.join(', ') : 'Validation failed';
      });
      
      return new ValidationPipe().createExceptionFactory()(errors);
    },
  }));
  
  // Setup CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*').split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Use global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Use global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Use global timeout interceptor
  app.useGlobalInterceptors(new TimeoutInterceptor());
  
  // Use global cache interceptor
  app.useGlobalInterceptors(new CacheInterceptor());
  
  // Use global rate limit interceptor
  app.useGlobalInterceptors(new RateLimitInterceptor());
  
  // Use global compression interceptor
  app.useGlobalInterceptors(new CompressionInterceptor());
  
  // Use global helmet interceptor
  app.useGlobalInterceptors(new HelmetInterceptor());
  
  // Use global cors interceptor
  app.useGlobalInterceptors(new CorsInterceptor());
  
  // Apply global JWT and CSRF authentication
  const globalAuthGuard = app.get(GlobalAuthGuard);
  app.useGlobalGuards(globalAuthGuard);
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Laundry App API')
    .setDescription('API documentation for Laundry App')
    .setVersion('1.0')
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

  // Get port from config
  const port = configService.get<number>('PORT', 3000);

  // Start server
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}

bootstrap(); 