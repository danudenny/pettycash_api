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
import { RoleModule } from './app/modules/role.module';
import { UserRoleModule } from './app/modules/user-role.module';
import { UserModule } from './app/modules/user.module';
import { BudgetModule } from './app/modules/budget.module';
import { AuthModule } from './app/modules/auth.module';
import { BudgetItemModule } from './app/modules/budget-item.module';
import { ExpenseModule } from './app/modules/expense.module';
import { JournalModule } from './app/modules/journal.module';
import { LoanModule } from './app/modules/loan.module';
import { BalanceModule } from './app/modules/balance.module';
import { AllocationBalanceModule } from './app/modules/allocation-balance.module';
import { AccountStatementModule } from './app/modules/account-statement.module';
import { BudgetRequestModule } from './app/modules/budget.request.module';
// import { BudgetRequestItemModule } from './app/modules/budget.request-item.module';

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
    EmployeeModule,
    UserModule,
    AuthModule,
    RoleModule,
    UserRoleModule,
    BudgetModule,
    BudgetItemModule,
    BudgetRequestModule,
    // BudgetRequestItemModule,
    ExpenseModule,
    JournalModule,
    LoanModule,
    BalanceModule,
    AllocationBalanceModule,
    AccountStatementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
