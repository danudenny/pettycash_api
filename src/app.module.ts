import { DownPaymentModule } from './app/modules/down-payment.module';
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
import { VoucherModule } from './app/modules/voucher.module';
import { BudgetRequestModule } from './app/modules/budget-request.module';
import { ReportDownPaymentModule } from './app/modules/report-down-payment.module';
import { BudgetRequestItemModule } from './app/modules/budget-request-item.module';
import { AccountDailyClosingModule } from './app/modules/account-daily-closing.module';
import { BankBranchModule } from './app/modules/bank-branch.module';
import { ReportBudgetModule } from './app/modules/report-budget.module';
import { ReportBalanceModule } from './app/modules/report-balance.module';
import { VehicleModule } from './app/modules/vehicle.module';
import { OtherModule } from './app/modules/other.module';
import { AttachmentTypeModule } from './app/modules/attachment-type.module';
import { CashflowTypeModule } from './app/modules/cashflow-type.module';
import { ReportParkingJournalModule } from './app/modules/report-parking-journal.module';
import { ReportPenggunaanKendaraanModule } from './app/modules/report-penggunaan-kendaraan.module';

@Module({
  imports: [
    // TODO: use `@nestjs/config`?
    LoaderEnv,
    TypeOrmModule.forRoot(LoaderEnv.getTypeOrmConfig()),
    // TODO: add pinoHttp requestIdGenerator
    LoggerModule.forRoot(),
    // TODO: add Health checks (Terminus)
    BranchModule,
    BankBranchModule,
    PartnerModule,
    AccountCoaModule,
    PeriodModule,
    ProductModule,
    VehicleModule,
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
    BudgetRequestItemModule,
    DownPaymentModule,
    ExpenseModule,
    LoanModule,
    JournalModule,
    BalanceModule,
    AllocationBalanceModule,
    AccountStatementModule,
    VoucherModule,
    AccountDailyClosingModule,
    AttachmentTypeModule,
    ReportDownPaymentModule,
    ReportBudgetModule,
    ReportBalanceModule,
    ReportParkingJournalModule,
    CashflowTypeModule,
    OtherModule,
    ReportPenggunaanKendaraanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
