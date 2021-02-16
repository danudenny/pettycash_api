import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { LoaderEnv } from './config/loader';
import { BranchModule } from './app/modules/branch.module';
import { PeriodModule } from './app/modules/period.module';
import { ProductModule } from './app/modules/product.module';
import { GlobalSettingModule } from './app/modules/global-setting.module';
import { AccountCoaModule } from './app/modules/account-coa.module';
import { PartnerModule } from './app/modules/partner.module';
import { TaxModule } from './app/modules/tax.module';
import { DepartmentModule } from './app/modules/department.module';
import { EmployeeModule } from './app/modules/employee.module';

@Module({
  imports: [
    // TODO: use `@nestjs/config`?
    LoaderEnv,
    TypeOrmModule.forRoot(LoaderEnv.getTypeOrmConfig()),
    // TODO: add pinoHttp requestIdGenerator
    LoggerModule.forRoot(),
    // TODO: add Health checks (Terminus)
    BranchModule,
    PartnerModule,
    AccountCoaModule,
    PeriodModule,
    ProductModule,
    GlobalSettingModule,
    TaxModule,
    DepartmentModule,
    EmployeeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
