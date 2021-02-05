import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { LoaderEnv } from './config/loader';
import { BranchModule } from './app/modules/branch.module';
import { PeriodModule } from './app/modules/period.module';
import { ProductModule } from './app/modules/product.module';

@Module({
  imports: [
    // TODO: use `@nestjs/config`?
    LoaderEnv,
    TypeOrmModule.forRoot(LoaderEnv.getTypeOrmConfig()),
    // TODO: add pinoHttp requestIdGenerator
    LoggerModule.forRoot(),
    // TODO: add Health checks (Terminus)
    BranchModule,
    PeriodModule,
    ProductModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
