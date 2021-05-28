import { AccountCashboxItem } from '../../../../model/account-cashbox-item.entity';
import { AccountDailyClosing } from '../../../../model/account-daily-closing.entity';
import { AccountCashboxItemsDTO } from '../dto/account-cashbox-items.dto';
import { AccountDailyClosingDetailDTO } from '../dto/account-daily-closing-detail.dto';
import { AccountDailyClosingDTO } from '../dto/account-daily-closing.dto';

export class AccountDailyClosingMapper {
  public static fromArrayDTO(dto: Partial<AccountDailyClosingDTO[]>) {
    const it = dto.map((accountDailyClosingDTO) => {
      const item = new AccountDailyClosingDTO();
      item.id = accountDailyClosingDTO.id;
      item.responsibleUserId = accountDailyClosingDTO.responsibleUserId;
      item.responsibleUserNik = accountDailyClosingDTO.responsibleUserNik;
      item.responsibleUserFirstName =
        accountDailyClosingDTO.responsibleUserFirstName;
      item.responsibleUserLastName =
        accountDailyClosingDTO.responsibleUserLastName;
      item.closingDate = accountDailyClosingDTO.closingDate;
      item.openingBankAmount = +accountDailyClosingDTO.openingBankAmount;
      item.closingBankAmount = +accountDailyClosingDTO.closingBankAmount;
      item.openingCashAmount = +accountDailyClosingDTO.openingCashAmount;
      item.closingCashAmount = +accountDailyClosingDTO.closingCashAmount;
      item.reason = accountDailyClosingDTO.reason;

      return item;
    });

    return it;
  }

  public static fromEntity(entity: Partial<AccountDailyClosing>) {
    const item = new AccountDailyClosingDetailDTO();
    item.id = entity.id;
    item.closingDate = entity.closingDate;
    item.responsibleUserId = entity.responsibleUserId;
    item.responsibleUserNik = entity.createUser.username;
    item.responsibleUserFirstName =
      entity.createUser && entity.createUser.firstName;
    item.responsibleUserLastName =
      entity.createUser && entity.createUser.lastName;
    item.openingBankAmount = entity.openingBankAmount;
    item.closingBankAmount = entity.closingBankAmount;
    item.openingCashAmount = entity.openingCashAmount;
    item.closingCashAmount = entity.closingCashAmount;
    item.accountCashboxItems = this.toAccountCashboxItemsDTO(entity.cashItems);
    item.reason = entity.reason;

    return item;
  }

  private static toAccountCashboxItemsDTO(entities: AccountCashboxItem[]) {
    const items = entities.map((entity) => {
      const item = new AccountCashboxItemsDTO();
      item.id = entity.id;
      item.pieces = entity.pieces;
      item.total = entity.total;
      item.totalAmount = entity.totalAmount;

      return item;
    });

    return items;
  }
}
