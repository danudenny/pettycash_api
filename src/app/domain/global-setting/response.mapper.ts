import { GlobalSetting } from '../../../model/global-setting.entity';
import { GlobalSettingDTO } from './global-setting.dto';

export class GlobalSettingResponseMapper {
  public static toDTO(dto: Partial<GlobalSettingDTO>): GlobalSettingDTO {
    const it = new GlobalSettingDTO();
    it.voucherPartnerId = dto.voucherPartnerId;
    it.voucherPartnerName = dto.voucherPartnerName;
    it.deviationAmount = dto.deviationAmount;
    it.cashTransitCoaId = dto.cashTransitCoaId;
    it.cashTransitCoaCode = dto.cashTransitCoaCode;
    it.downPaymentPerdinCoaId = dto.downPaymentPerdinCoaId;
    it.downPaymentPerdinCoaCode = dto.downPaymentPerdinCoaCode;
    it.downPaymentReimbursementCoaId = dto.downPaymentReimbursementCoaId;
    it.downPaymentReimbursementCoaCode = dto.downPaymentReimbursementCoaCode;
    return it;
  }

  public static fromEntity(ety: Partial<GlobalSetting>) {
    return this.toDTO({
      ...ety,
      voucherPartnerName: ety.voucherPartner && ety.voucherPartner.name,
      cashTransitCoaCode: ety.cashTransitCoa && ety.cashTransitCoa.code,
      downPaymentPerdinCoaCode:
        ety.downPaymentPerdinCoa && ety.downPaymentPerdinCoa.code,
      downPaymentReimbursementCoaCode:
        ety.downPaymentReimbursementCoa && ety.downPaymentReimbursementCoa.code,
    });
  }
}
