import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountDailyClosing } from '../../model/account-daily-closing.entity';
import { AccountDailyClosingController } from '../controllers/v1/account-daily-closing.controller';
import { AccountDailyClosingService } from '../services/v1/account-daily-closing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountDailyClosing
    ])
  ],
  providers: [AccountDailyClosingService],
  controllers: [AccountDailyClosingController]
})
export class AccountDailyClosingModule {}
