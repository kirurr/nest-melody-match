import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

function initSwagger(app: INestApplication<any>) {
  const endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  const redirect = 'http://localhost:3000/auth/google/redirect';

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: redirect,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope:
      'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    state: 'nest',
    include_granted_scopes: 'true',
  });

  const config = new DocumentBuilder()
    .setTitle('Nest Melody Match')
    .setDescription('Nest Melody Match API')
    .setVersion('1.0')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl:
            'https://accounts.google.com/o/oauth2/auth' +
            '?' +
            params.toString(),
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

  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    initSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
