import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { LoaderEnv } from '../src/config/loader';

jest.setTimeout(5 * 60 * 1000);
let app: INestApplication;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [
      LoaderEnv,
      TypeOrmModule.forRoot(LoaderEnv.getTypeOrmConfig()),
      LoggerModule.forRoot(),
    ],
  }).compile();

  app = module.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});
