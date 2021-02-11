import { InjectRepository } from '@nestjs/typeorm';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { Repository } from 'typeorm';
import { GlobalSettingResponse } from '../../domain/global-setting/response.dto';

export class GlobalSettingService {
  constructor(
    @InjectRepository(GlobalSetting)
    private readonly settingRepo: Repository<GlobalSetting>,
  ) {}

  async get(): Promise<any> {
    const setting = await this.settingRepo.findOne({
      relations: [
        'voucherPartner',
        'cashTransitCoa',
        'downPaymentPerdinCoa',
        'downPaymentReimbursementCoa',
      ],
    });
    return new GlobalSettingResponse(setting);
  }
}
