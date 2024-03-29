import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  getManager,
  EntityManager,
  createQueryBuilder,
} from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AttachmentService } from '../../../common/services/attachment.service';
import { AccountCashboxItem } from '../../../model/account-cashbox-item.entity';
import { AccountDailyClosing } from '../../../model/account-daily-closing.entity';
import { Attachment } from '../../../model/attachment.entity';
import { User } from '../../../model/user.entity';
import { AccountDailyClosingAttachmentDTO } from '../../domain/account-daily-closing/dto/account-daily-closing-attachment.dto';
import { CreateAccountCashboxItemsDTO } from '../../domain/account-daily-closing/dto/create-account-cashbox-items.dto';
import { AccountDailyClosingAttachmentResponse } from '../../domain/account-daily-closing/response/account-daily-closing-attachments.response';
import { CreateAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/create-account-daily-closing.dto';
import { CreateAccountDailyClosingResponse } from '../../domain/account-daily-closing/response/create-account-daily-closing.response';
import { AccountDailyClosingDetailResponse } from '../../domain/account-daily-closing/response/get-account-daily-closing.response';
import { AccountDailyClosingWithPaginationResponse } from '../../domain/account-daily-closing/response/get-all-account-daily-closing.response';
import { QueryAccountDailyClosingDTO } from '../../domain/account-daily-closing/dto/query-account-daily-closing.payload.dto';
import { AuthService } from './auth.service';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { LoaderEnv } from '../../../config/loader';
import { AwsS3Service } from '../../../common/services/aws-s3.service';
import { ReportAccountDailyClosingSummaryResponse } from '../../domain/report-account-daily-closing/summary-response.dto';
import { QueryReportAccountDailyClosingDTO } from '../../domain/report-account-daily-closing/summary-query.dto';

@Injectable()
export class AccountDailyClosingService {
  constructor(
    @InjectRepository(AccountDailyClosing)
    private readonly accountDailyClosingRepo: Repository<AccountDailyClosing>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    @InjectRepository(GlobalSetting)
    private readonly settingRepo: Repository<GlobalSetting>,
  ) {}

  public async list(
    query?: QueryAccountDailyClosingDTO,
  ): Promise<AccountDailyClosingWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(AccountDailyClosing, 'adc', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['startDate__gte'] = 'adc.closing_date';
    qb.fieldResolverMap['endDate__lte'] = 'adc.closing_date';
    qb.fieldResolverMap['branchId'] = 'adc.branch_id';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['adc.id', 'id'],
      ['adc.closing_date', 'closingDate'],
      ['adc.responsible_user_id', 'responsibleUserId'],
      ['brc.branch_name', 'branchName'],
      ['usr.username', 'responsibleUserNik'],
      ['usr.first_name', 'responsibleUserFirstName'],
      ['usr.last_name', 'responsibleUserLastName'],
      ['adc.opening_bank_amount', 'openingBankAmount'],
      ['adc.closing_bank_amount', 'closingBankAmount'],
      ['adc.opening_cash_amount', 'openingCashAmount'],
      ['adc.closing_cash_amount', 'closingCashAmount'],
      ['adc.opening_bon_amount', 'openingBonAmount'],
      ['adc.closing_bon_amount', 'closingBonAmount'],
      ['adc.reason_bank', 'reasonBank'],
      ['adc.reason_cash', 'reasonCash'],
      ['adc.reason_bon', 'reasonBon'],
    );
    qb.leftJoin((e) => e.createUser, 'usr');
    qb.leftJoin((e) => e.branch, 'brc');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }

    const accountDailyClosing = await qb.exec();
    return new AccountDailyClosingWithPaginationResponse(
      accountDailyClosing,
      params,
    );
  }

  public async getById(id: string): Promise<AccountDailyClosingDetailResponse> {
    const accountDailyClosing = await this.accountDailyClosingRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['createUser', 'cashItems'],
    });

    if (!accountDailyClosing) {
      throw new NotFoundException(`Account Daily Closing ID ${id} not found!`);
    }

    return new AccountDailyClosingDetailResponse(accountDailyClosing);
  }

  public async getSummary(
    params?: QueryReportAccountDailyClosingDTO,
  ): Promise<ReportAccountDailyClosingSummaryResponse> {
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    if (!userBranchIds?.length) {
      throw new UnprocessableEntityException(
        `Current User request not assigned to a branch!`,
      );
    }

    const qb = new QueryBuilder(AccountDailyClosing, 'adc', params);

    qb.fieldResolverMap['startDate__gte'] = 'adc.closing_date';
    qb.fieldResolverMap['endDate__lte'] = 'adc.closing_date';
    qb.fieldResolverMap['branchId'] = 'adc.branch_id';

    qb.applyFilterQueries();
    qb.selectRaw(
      ['SUM(COALESCE(adc.opening_bank_amount, 0))', 'openingBankAmount'],
      ['SUM(COALESCE(adc.closing_bank_amount, 0))', 'closingBankAmount'],
      ['SUM(COALESCE(adc.opening_cash_amount, 0))', 'openingCashAmount'],
      ['SUM(COALESCE(adc.closing_cash_amount, 0))', 'closingCashAmount'],
      ['SUM(COALESCE(adc.opening_bon_amount, 0))', 'openingBonAmount'],
      ['SUM(COALESCE(adc.closing_bon_amount, 0))', 'closingBonAmount'],
    );
    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }

    const results = await qb.exec();
    return new ReportAccountDailyClosingSummaryResponse(results);
  }

  public async create(
    payload: CreateAccountDailyClosingDTO,
  ): Promise<CreateAccountDailyClosingResponse> {
    const accountDailyClosing = await this.getAccountDailyClosingFromDTO(
      payload,
    );
    const result = await this.accountDailyClosingRepo.save(accountDailyClosing);

    return new CreateAccountDailyClosingResponse(result);
  }

  public async listAttachment(
    accountDailyClosingId: string,
  ): Promise<AccountDailyClosingAttachmentResponse> {
    const qb = new QueryBuilder(AccountDailyClosing, 'adc', {});

    qb.selectRaw(
      ['adc.id', 'accountDailyClosingId'],
      ['att.id', 'id'],
      ['att."name"', 'name'],
      ['att.filename', 'fileName'],
      ['att.file_mime', 'fileMime'],
      ['att.url', 'url'],
      ['att.s3_acl', 'S3ACL'],
      ['att."path"', 'S3Key'],
      ['att.bucket_name', 'S3BucketName'],
    );
    qb.innerJoin(
      (e) => e.attachments,
      'att',
      (j) =>
        j.andWhere(
          (e) => e.isDeleted,
          (v) => v.isFalse(),
        ),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(accountDailyClosingId),
    );

    const { CACHE_ATTACHMENT_DURATION_IN_MINUTES } = LoaderEnv.envs;
    const cacheDuration = (CACHE_ATTACHMENT_DURATION_IN_MINUTES || 5) * 60; // in seconds

    qb.qb.cache(
      `accountdailyclosing:${accountDailyClosingId}:attachments`,
      1000 * (cacheDuration - 5),
    );
    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    const signedAttachments = [];
    for (const att of attachments) {
      if (att.S3ACL === 'private') {
        att.url = await AwsS3Service.getSignedUrl(
          att.S3BucketName,
          att.S3Key,
          cacheDuration,
        );
      }
      delete att.S3ACL;
      delete att.S3Key;
      delete att.S3BucketName;
      signedAttachments.push(att);
    }

    return new AccountDailyClosingAttachmentResponse(signedAttachments);
  }

  public async createAttachment(
    accountDailyClosingId: string,
    files?: any,
  ): Promise<AccountDailyClosingAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const accountDailyClosing = await manager.findOne(
            AccountDailyClosing,
            {
              where: { id: accountDailyClosingId, isDeleted: false },
              relations: ['attachments'],
            },
          );

          if (!accountDailyClosing) {
            throw new NotFoundException(
              `Account Daily Closing ${accountDailyClosingId} not found!`,
            );
          }

          const existingAttachments = accountDailyClosing.attachments;
          const newAttachments: Attachment[] = await this.uploadAndRetrieveFiles(
            accountDailyClosingId,
            manager,
            files,
          );

          accountDailyClosing.attachments = [].concat(
            existingAttachments,
            newAttachments,
          );
          accountDailyClosing.updateUser = await AuthService.getUser();

          await manager.save(accountDailyClosing);
          await manager.connection?.queryResultCache?.remove([
            `accountdailyclosing:${accountDailyClosingId}:attachments`,
          ]);

          return newAttachments;
        },
      );

      return new AccountDailyClosingAttachmentResponse(
        createAttachment as AccountDailyClosingAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async deleteAttachment(
    id: string,
    attachmentId: string,
  ): Promise<void> {
    const attExist = await createQueryBuilder('attachment', 'att')
      .leftJoin(
        'account_daily_closing_attachment',
        'adct',
        'att.id = adct.attachment_id',
      )
      .where('adct.account_daily_closing_id = :id', { id })
      .andWhere('adct.attachment_id = :attachmentId', { attachmentId })
      .andWhere('att.isDeleted = false')
      .getOne();

    if (!attExist) {
      throw new NotFoundException(`Attachment ${attachmentId} not found!`);
    }

    const deleteAttachment = await this.attachmentRepo.update(attachmentId, {
      isDeleted: true,
    });

    if (!deleteAttachment) {
      throw new BadRequestException('Gagal menghapus attachment!');
    }

    await getManager().connection?.queryResultCache?.remove([
      `accountdailyclosing:${id}:attachments`,
    ]);
  }

  private async getAccountDailyClosingFromDTO(
    payload: CreateAccountDailyClosingDTO,
  ) {
    const user = await AuthService.getUserBranches();
    const branchId = user && user.branches && user.branches[0].id;

    const accountDailyClosing = new AccountDailyClosing();
    accountDailyClosing.branchId = branchId;
    accountDailyClosing.closingDate = payload.closingDate;
    accountDailyClosing.responsibleUserId = user.id;
    accountDailyClosing.openingBankAmount = payload.openingBankAmount;
    accountDailyClosing.closingBankAmount = payload.closingBankAmount;
    accountDailyClosing.openingCashAmount = payload.openingCashAmount;
    accountDailyClosing.closingCashAmount = payload.closingCashAmount;
    accountDailyClosing.openingBonAmount = payload.openingBonAmount;
    accountDailyClosing.closingBonAmount = payload.closingBonAmount;
    accountDailyClosing.cashItems = this.getAccountCashboxItemsFromDTO(
      payload.accountCashboxItems,
      user,
    );
    accountDailyClosing.reasonBank = payload.reasonBank;
    accountDailyClosing.reasonCash = payload.reasonCash;
    accountDailyClosing.reasonBon = payload.reasonBon;
    accountDailyClosing.createUserId = user?.id;
    accountDailyClosing.updateUserId = user?.id;

    return accountDailyClosing;
  }

  private getAccountCashboxItemsFromDTO(
    accountCashboxItems: CreateAccountCashboxItemsDTO[],
    user: User,
  ): AccountCashboxItem[] {
    const items: AccountCashboxItem[] = [];

    accountCashboxItems.forEach(function (accountCashboxItem) {
      const item = new AccountCashboxItem();
      item.pieces = accountCashboxItem.pieces;
      item.total = accountCashboxItem.number;
      item.totalAmount = accountCashboxItem.total;
      (item.createUser = user), (item.updateUser = user);

      items.push(item);
    });

    return items;
  }

  private async uploadAndRetrieveFiles(
    accountDailyClosingId: string,
    manager: EntityManager,
    files?: any,
    attachmentType?: any,
  ): Promise<Attachment[]> {
    let newAttachments: Attachment[] = [];

    if (files && files.length) {
      const accountDailyClosingPath = `accountDailyClosingPath/${accountDailyClosingId}`;
      newAttachments = await AttachmentService.uploadFiles(
        files,
        (file) => {
          const rid = randomStringGenerator().split('-')[0];
          const pathId = `${accountDailyClosingPath}_${rid}_${file.originalname}`;

          return pathId;
        },
        attachmentType,
        manager,
      );
    }

    return newAttachments;
  }
}
