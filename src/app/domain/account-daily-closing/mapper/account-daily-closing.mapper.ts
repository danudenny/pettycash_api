import { AccountCashboxItem } from '../../../../model/account-cashbox-item.entity';
import { AccountDailyClosing } from '../../../../model/account-daily-closing.entity';
import { AccountCashboxItemsDTO } from '../dto/account-cashbox-items.dto';
import { AccountDailyClosingDetailDTO } from '../dto/account-daily-closing-detail.dto';
import { AccountDailyClosingDTO } from '../dto/account-daily-closing.dto';

export class AccountDailyClosingMapper {
  public static fromArrayDTO(dto: Partial<AccountDailyClosingDTO[]>) {
    return dto.map((accountDailyClosingDTO) => {
      const item = new AccountDailyClosingDTO();
      item.id = accountDailyClosingDTO.id;
      item.branchName = accountDailyClosingDTO.branchName
      item.responsibleUserId = accountDailyClosingDTO.responsibleUserId;
      item.responsibleUserNik = accountDailyClosingDTO.responsibleUserNik;
      item.responsibleUserFirstName =
        accountDailyClosingDTO.responsibleUserFirstName;
      item.responsibleUserLastName =
        accountDailyClosingDTO.responsibleUserLastName || '';
      item.closingDate = accountDailyClosingDTO.closingDate;
      item.openingBankAmount = +accountDailyClosingDTO.openingBankAmount;
      item.closingBankAmount = +accountDailyClosingDTO.closingBankAmount;
      item.openingCashAmount = +accountDailyClosingDTO.openingCashAmount;
      item.closingCashAmount = +accountDailyClosingDTO.closingCashAmount;
      item.openingBonAmount = +accountDailyClosingDTO.openingBonAmount;
      item.closingBonAmount = +accountDailyClosingDTO.closingBonAmount;
      item.reasonBank = accountDailyClosingDTO.reasonBank;
      item.reasonCash = accountDailyClosingDTO.reasonCash;
      item.reasonBon = accountDailyClosingDTO.reasonBon;
      item.bankDifference =
        accountDailyClosingDTO.openingBankAmount -
        accountDailyClosingDTO.closingBankAmount;
      item.cashDifference =
        accountDailyClosingDTO.openingCashAmount -
        accountDailyClosingDTO.closingCashAmount;
      item.bonDifference =
        accountDailyClosingDTO.openingBonAmount -
        accountDailyClosingDTO.closingBonAmount;
      item.totalDifference =
        item.bankDifference + item.cashDifference + item.bonDifference;
      item.totalOpeningAmount =
        item.openingBankAmount + item.openingCashAmount + item.openingBonAmount;
      item.totalClosingAmount =
        item.closingBankAmount + item.closingCashAmount + item.closingBonAmount;
      return item;
    });
  }

  public static fromEntity(entity: Partial<AccountDailyClosing>) {
    const item = new AccountDailyClosingDetailDTO();
    item.id = entity.id;
    item.branchName = entity.branch && entity.branch.branchName;
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
    item.openingBonAmount = entity.openingBonAmount;
    item.closingBonAmount = entity.closingBonAmount;
    item.reasonBank = entity.reasonBank;
    item.reasonCash = entity.reasonCash;
    item.reasonBon = entity.reasonBon;
    item.accountCashboxItems = this.toAccountCashboxItemsDTO(entity.cashItems);

    return item;
  }

  private static toAccountCashboxItemsDTO(entities: AccountCashboxItem[]) {
    return entities.map((entity) => {
      const item = new AccountCashboxItemsDTO();
      item.id = entity.id;
      item.pieces = entity.pieces;
      item.total = entity.total;
      item.totalAmount = entity.totalAmount;

      return item;
    });
  }
}
