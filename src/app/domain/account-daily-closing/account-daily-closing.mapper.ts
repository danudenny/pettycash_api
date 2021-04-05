import { AccountDailyClosingDTO } from './account-daily-closing.dto';

export class AccountDailyClosingMapper {

  public static fromDTO(dto: Partial<AccountDailyClosingDTO>) {
    const it = new AccountDailyClosingDTO();
    it.id = dto.id;

    return it;
  }

  public static fromArrayDTO(dto: Partial<AccountDailyClosingDTO[]>) {
    const it = dto.map((accountDailyClosingDTO) => {
      const item = new AccountDailyClosingDTO();
      item.id = accountDailyClosingDTO.id;
      item.closingDate = accountDailyClosingDTO.closingDate;
      item.openingBankAmount = accountDailyClosingDTO.openingBankAmount;
      item.closingBankAmount = accountDailyClosingDTO.closingBankAmount;
      item.openingCashAmount = accountDailyClosingDTO.openingCashAmount;
      item.closingCashAmount = accountDailyClosingDTO.closingCashAmount;

      return item;
    })

    return it;
  }
}