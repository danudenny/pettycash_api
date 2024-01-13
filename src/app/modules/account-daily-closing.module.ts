import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountDailyClosing } from '../../model/account-daily-closing.entity';
import { Attachment } from '../../model/attachment.entity';
import { GlobalSetting } from '../../model/global-setting.entity';
import { AccountDailyClosingController } from '../controllers/v1/account-daily-closing.controller';
import { ReportAccountDailyClosingController } from '../controllers/v1/report-account-daily-closing.controller';
import { AccountDailyClosingService } from '../services/v1/account-daily-closing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountDailyClosing, Attachment, GlobalSetting]),
  ],
  providers: [AccountDailyClosingService],
  controllers: [
    AccountDailyClosingController,
    ReportAccountDailyClosingController,
  ],
})
export class AccountDailyClosingModule {}
