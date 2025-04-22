import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

function initSwagger(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('Nest Melody Match')
    .setDescription('Nest Melody Match API')
    .setVersion('1.0')
    .addGlobalResponse(
      {
        status: 500,
        description: 'Internal server error',
      },
      { status: 401, description: 'Unauthorized' },
    )
    .addBearerAuth()
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            profile: 'Profile scope',
            email: 'Email scope',
          },
        },
      },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      oauth2RedirectUrl: process.env.GOOGLE_REDIRECT_URI,
      initOAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scopes: ['email', 'profile'],
      },
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    initSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
