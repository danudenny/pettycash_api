import { AccountDailyClosingDTO } from './account-daily-closing.dto';

export class AccountDailyClosingMapper {

  public static fromDTO(dto: Partial<AccountDailyClosingDTO>) {
    const it = new AccountDailyClosingDTO();
    it.id = dto.id;

    return it;
  }
}