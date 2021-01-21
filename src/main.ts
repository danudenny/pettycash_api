import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { AppModule } from './app.module';
import { LoaderEnv } from './config/loader';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger, PinoLogger } from 'nestjs-pino';
import { BranchQueueService } from './app/queues/branch.queue.service';
import { BranchCronService } from './app/queues/branch.cron.service';

const logger = new PinoLogger({});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  // nestjs-pino
  app.useLogger(app.get(Logger));

  // NOTE: The default limit defined by body-parser is 100kb
  // https://github.com/expressjs/body-parser/blob/0632e2f378d53579b6b2e4402258f4406e62ac6f/lib/types/json.js#L53-L55
  // app.use(json({ limit: '10mb' }));
  // app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Only create bull-board if background job activated.
  if (LoaderEnv.envs.APP_USE_BACKGROUND_JOB) {
    const { UI } = require('bull-board');
    app.use('/bull/queues', UI);
  }

  // Only Build docs if not in production
  if (!LoaderEnv.isProduction()) {
    const options = new DocumentBuilder()
      .setTitle(LoaderEnv.envs.SWAGGER_API_TITLE)
      .setDescription(LoaderEnv.envs.SWAGGER_API_DESC)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
    logger.info(`Swagger docs builded to /docs/`);
  }

  await app.listen(LoaderEnv.envs.APP_PORT);
  logger.info(`Listen APP on PORT :: ${LoaderEnv.envs.APP_PORT}`);

  // Only run background job if activated
  if (LoaderEnv.envs.APP_USE_BACKGROUND_JOB) {
    // init background job
    BranchQueueService.boot();
    BranchCronService.init();
  }

}
bootstrap();
