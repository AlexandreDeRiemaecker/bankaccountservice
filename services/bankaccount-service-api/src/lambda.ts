import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import { Context, Handler } from 'aws-lambda';
import express from 'express';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedServer: Handler;

/* istanbul ignore file */
async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Enable CORS with * (should be specified for production)
    nestApp.enableCors();

    // Configure Swagger for API documentation
    const config = new DocumentBuilder()
      .setTitle('Bank Account Service API')
      .addServer('/v1')
      .setVersion('1.0')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(nestApp, config);

    // Setup Swagger module
    SwaggerModule.setup('swagger', nestApp, documentFactory, {
      explorer: true,
    });

    // Initialize the NestJS application
    await nestApp.init();

    // Cache the serverless Express handler
    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer;
}

// Lambda handler function
const handler = async (event: any, context: Context, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};

module.exports.handler = handler;
