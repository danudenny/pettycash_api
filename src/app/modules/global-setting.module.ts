import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountCoa } from '../../model/account-coa.entity';
import { GlobalSetting } from '../../model/global-setting.entity';
import { Partner } from '../../model/partner.entity';
import { GlobalSettingController } from '../controllers/v1/global-setting.controller';
import { GlobalSettingService } from '../services/v1/global-setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalSetting, AccountCoa, Partner])],
  providers: [GlobalSettingService],
  controllers: [GlobalSettingController],
  exports: [],
})
export class GlobalSettingModule {}
