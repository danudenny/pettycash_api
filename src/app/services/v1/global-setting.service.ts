import { HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { Repository, getConnection } from 'typeorm';
import { GlobalSettingResponse } from '../../domain/global-setting/response.dto';
import { UpdateGlobalSettingDTO } from '../../domain/global-setting/global-setting.payload.dto';

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

  async update(payload: UpdateGlobalSettingDTO): Promise<any> {
    await this.settingRepo.update({}, payload);
    await getConnection().queryResultCache?.remove(['global_settings']);
    return { status: HttpStatus.OK, message: 'Success Update Global Setting' };
  }
}
