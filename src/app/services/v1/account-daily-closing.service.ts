import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, EntityManager } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AttachmentService } from '../../../common/services/attachment.service';
import { AccountCashboxItem } from '../../../model/account-cashbox-item.entity';
import { AccountDailyClosing } from '../../../model/account-daily-closing.entity';
import { Attachment } from '../../../model/attachment.entity';
import { User } from '../../../model/user.entity';
import { AccountDailyClosingAttachmentDTO } from '../../domain/account-daily-closing/dto/account-daily-closing-attachment.dto';
import { CreateAccountCashboxItemsDTO } from '../../domain/account-daily-closing/dto/create-account-cashbox-items.dto';
import { CreateAccountDailyClosingAttachmentResponse } from '../../domain/account-daily-closing/response/create-account-daily-closing-attachments.response';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/response/create-account-daily-closing.response';
import { AccountDailyClosingDetailResponse } from '../../domain/account-daily-closing/response/get-account-daily-closing.response';
import { AccountDailyClosingWithPaginationResponse } from '../../domain/account-daily-closing/response/get-all-account-daily-closing.response';
import { QueryAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/query-account-daily-closing.payload.dto';
import { AuthService } from './auth.service';

@Injectable()
export class AccountDailyClosingService {

  constructor(
    @InjectRepository(AccountDailyClosing)
    private readonly accountDailyClosingRepo: Repository<AccountDailyClosing>
  ) {}

  public async list(
    query?: QueryAccountDailyClosingDTO,
  ): Promise<AccountDailyClosingWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(AccountDailyClosing, 'adc', params);

    qb.fieldResolverMap['startDate__gte'] = 'adc.closingDate';
    qb.fieldResolverMap['endDate__gte'] = 'adc.closingDate';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['adc.id', 'id'],
      ['adc.closing_date', 'closingDate'],
      ['adc.responsible_user_id', 'responsibleUserId'],
      ['usr.first_name', 'responsibleUserFirstName'],
      ['usr.last_name', 'responsibleUserLastName'],
      ['adc.opening_bank_amount', 'openingBankAmount'],
      ['adc.closing_bank_amount', 'closingBankAmount'],
      ['adc.opening_cash_amount', 'openingCashAmount'],
      ['adc.closing_cash_amount', 'closingCashAmount']
    );
    qb.leftJoin((e) => e.createUser, 'usr');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse()
    )

    const accountDailyClosing = await qb.exec();
    return new AccountDailyClosingWithPaginationResponse(accountDailyClosing, params);
  }

  public async getById(id: string): Promise<AccountDailyClosingDetailResponse> {
    const accountDailyClosing = await this.accountDailyClosingRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['createUser', 'cashItems']
    });
    
    if (!accountDailyClosing) {
      throw new NotFoundException(`Expense ID ${id} not found!`);
    }

    return new AccountDailyClosingDetailResponse(accountDailyClosing);
  }

  public async create(
    payload: CreateAccountDailyClosingDTO
  ): Promise<CreateAccountDailyClosingResponse>{
    const accountDailyClosing = await this.getAccountDailyClosingFromDTO(payload);
    const result = await this.accountDailyClosingRepo.save(accountDailyClosing);

    return new CreateAccountDailyClosingResponse(result);
  }

  public async createAttachment(
    accountDailyClosingId: string,
    files?: any,
  ): Promise<CreateAccountDailyClosingAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const accountDailyClosing = await manager.findOne(AccountDailyClosing, {
            where: { id: accountDailyClosingId, isDeleted: false },
            relations: ['attachments']
          });

          if (!accountDailyClosing) {
            throw new NotFoundException(`Account Daily Closing ${accountDailyClosingId} not found!`);
          }

          const existingAttachments = accountDailyClosing.attachments;
          const newAttachments: Attachment[] = await this.uploadAndRetrieveFiles(
            accountDailyClosingId, 
            manager, 
            files
          );
          
          accountDailyClosing.attachments = [].concat(existingAttachments, newAttachments);
          accountDailyClosing.updateUser = await AuthService.getUser();

          await manager.save(accountDailyClosing);

          return newAttachments;
        }
      );
      
      return new CreateAccountDailyClosingAttachmentResponse(
        createAttachment as AccountDailyClosingAttachmentDTO[]
      );

    } catch (error) {
      throw new BadRequestException(error);
    }
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
      payload.accountCashboxItems,
      user
    );
    accountDailyClosing.createUser = user;
    accountDailyClosing.updateUser = user;

    return accountDailyClosing;
  }

  private getAccountCashboxItemsFromDTO(
    accountCashboxItems: CreateAccountCashboxItemsDTO[],
    user: User
  ): AccountCashboxItem[] {
    const items: AccountCashboxItem[] = [];
    
    accountCashboxItems.forEach(function (accountCashboxItem) {
      const item = new AccountCashboxItem();
      item.pieces = accountCashboxItem.pieces;
      item.total = accountCashboxItem.number;
      item.totalAmount = accountCashboxItem.total;
      item.createUser = user,
      item.updateUser = user

      items.push(item);
    });

    return items;
  }

  private async uploadAndRetrieveFiles(
    accountDailyClosingId: string,
    manager: EntityManager,
    files?: any
  ): Promise<Attachment[]> {
    let newAttachments: Attachment[] = []

    if (files && files.length) {
      const accountDailyClosingPath = `accountDailyClosingPath/${accountDailyClosingId}`
      newAttachments = await AttachmentService.uploadFiles(
        files,
        (file) => {
          const rid = randomStringGenerator().split('-')[0];
          const pathId = `${accountDailyClosingPath}_${rid}_${file.originalname}`;

          return pathId;
        },
        manager
      );
    }

    return newAttachments;
  }
}
