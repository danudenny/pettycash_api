import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountCashboxItem } from '../../../model/account-cashbox-item.entity';
import { AccountDailyClosing } from '../../../model/account-daily-closing.entity';
import { CreateAccountCashboxItemsDTO } from '../../domain/account-daily-closing/create-account-cashbox-items.dto';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/create-account-daily-closing.response';
import { AuthService } from './auth.service';

@Injectable()
export class AccountDailyClosingService {

  constructor(
    @InjectRepository(AccountDailyClosing)
    private readonly accountDailyClosingRepo: Repository<AccountDailyClosing>
  ) {}

  public async create(
    payload: CreateAccountDailyClosingDTO
  ): Promise<CreateAccountDailyClosingResponse>{
    const accountDailyClosing = await this.getAccountDailyClosingFromDTO(payload);
    const result = await this.accountDailyClosingRepo.save(accountDailyClosing);

    return new CreateAccountDailyClosingResponse(result);
  }

  private async getAccountDailyClosingFromDTO(payload: CreateAccountDailyClosingDTO) {
    const user = await AuthService.getUser({ relations: ['branches'] });
    const branchId = user && user.branches && user.branches[0].id;

    const accountDailyClosing = new AccountDailyClosing();
    accountDailyClosing.branchId = branchId;
    accountDailyClosing.closingDate = payload.closingDate;
    accountDailyClosing.responsibleUserId = user.id
    accountDailyClosing.openingBankAmount = payload.openingBankAmount;
    accountDailyClosing.closingBankAmount = payload.closingBankAmount;
    accountDailyClosing.openingCashAmount = payload.openingCashAmount;
    accountDailyClosing.closingCashAmount = payload.closingCashAmount;
    accountDailyClosing.cashItems = this.getAccountCashboxItemsFromDTO(
      payload.accountCashboxItems
    );
    accountDailyClosing.createUser = user;
    accountDailyClosing.updateUser = user;

    return accountDailyClosing;
  }

  private getAccountCashboxItemsFromDTO(
    accountCashboxItems: CreateAccountCashboxItemsDTO[]
  ): AccountCashboxItem[] {
    const items: AccountCashboxItem[] = [];
    
    accountCashboxItems.forEach(function (accountCashboxItem) {
      const item = new AccountCashboxItem();
      item.pieces = accountCashboxItem.pieces;
      item.total = accountCashboxItem.number;
      item.totalAmount = accountCashboxItem.total;

      items.push(item);
    });

    return items;
  }
}
