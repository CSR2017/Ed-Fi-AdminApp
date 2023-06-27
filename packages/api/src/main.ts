import './modes/dev';
process.env['NODE_CONFIG_DIR'] = './packages/api/config';
import './utils/checkEnv';

import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as config from 'config';
import * as pgSession from 'connect-pg-simple';
import * as expressSession from 'express-session';
import passport from 'passport';
import { Client } from 'pg';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'warn', 'error', 'verbose'],
  });
  const globalPrefix = 'api';
  await config.DB_ENCRYPTION_SECRET;
  const pgConnectionStr = await config.DB_CONNECTION_STRING;
  const pgClient = new Client({ connectionString: pgConnectionStr });
  await pgClient.connect();
  const existingSchema = await pgClient.query(
    "select schema_name from information_schema.schemata where schema_name = 'appsession'"
  );
  if (existingSchema.rowCount === 0)
    await pgClient.query('create schema appsession');

  app.use(
    expressSession.default({
      store: new (pgSession.default(expressSession.default))({
        createTableIfMissing: true,
        conString: pgConnectionStr,
        schemaName: 'appsession',
      }),
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, stopAtFirstError: false })
  );
  app.enableCors({ origin: config.FE_URL, credentials: true });
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    })
  );
  const port = config.API_PORT;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Starting Blocks Admin App')
    .setDescription(
      'OpenAPI spec for the EA Starting Blocks admin console application.'
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
