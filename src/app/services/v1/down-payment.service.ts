import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager, EntityManager } from 'typeorm';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
/** interfaces */
import { QueryDownPaymentDTO } from '../../domain/down-payment/down-payment-query.dto';
import { CreateDownPaymentDTO } from '../../domain/down-payment/down-payment-create.dto';
import { RejectDownPaymentDTO } from '../../domain/down-payment/down-payment-reject.dto';
import { ApproveDownPaymentDTO } from '../../domain/down-payment/down-payment-approve.dto';
import {
  DownPaymentState,
  DownPaymentType,
  JournalSourceType,
  JournalState,
  MASTER_ROLES,
  PeriodState,
} from '../../../model/utils/enum';
import {
  DownPaymentResponse,
  DownPaymentsWithPaginationResponse,
  ShowDownPaymentResponse,
} from '../../domain/down-payment/down-payment-response.dto';
/** Collections */
import { Branch } from '../../../model/branch.entity';
import { Period } from '../../../model/period.entity';
import { Journal } from '../../../model/journal.entity';
import { DownPayment } from '../../../model/down-payment.entity';
import { JournalItem } from '../../../model/journal-item.entity';
import { GlobalSetting } from '../../../model/global-setting.entity';
import { DownPaymentHistory } from '../../../model/down-payment-history.entity';
/** Services */
import { AuthService } from './auth.service';
import { GenerateCode } from '../../../common/services/generate-code.service';

@Injectable()
export class DownPaymentService {
  constructor(
    @InjectRepository(DownPayment)
    private readonly downPayEntity: Repository<DownPayment>,
    @InjectRepository(DownPaymentHistory)
    private readonly historyDownPayEntity: Repository<DownPaymentHistory>,
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  async findOne(filter: object): Promise<DownPayment> {
    return await this.downPayEntity.findOne(filter);
  }

  public async getAll(
    query?: QueryDownPaymentDTO,
  ): Promise<DownPaymentsWithPaginationResponse> {
    try {
      const params = { order: '^created_at', limit: 10, ...query };
      const qb = new QueryBuilder(DownPayment, 'dp', params);

      qb.fieldResolverMap['type'] = 'dp.type';
      qb.fieldResolverMap['state'] = 'dp.state';
      qb.fieldResolverMap['branchId'] = 'dp.branch_id';
      qb.fieldResolverMap['paymentType'] = 'dp.payment_type';
      qb.fieldResolverMap['number__icontains'] = 'dp.number';
      qb.fieldResolverMap['departmentId'] = 'dp.department_Id';
      qb.fieldResolverMap['startDate__gte'] = 'dp.transaction_date';
      qb.fieldResolverMap['endDate__lte'] = 'dp.transaction_date';
      qb.fieldResolverMap['destinationPlace'] = 'dp.destination_place';

      qb.applyFilterPagination();
      qb.selectRaw(
        ['dp.id', 'id'],
        ['dp.type', 'type'],
        ['dp.state', 'state'],
        ['dp.number', 'number'],
        ['dp.amount', 'amount'],
        ['dp.branch_id', 'branchId'],
        ['dp.employee_id', 'employeeId'],
        ['dp.description', 'description'],
        ['dp.payment_type', 'paymentType'],
        ['dp.department_id', 'departmentId'],
        ['dp.transaction_date', 'transactionDate'],
        ['dp.destination_place', 'destinationPlace'],
        ['brc.branch_name', 'branchName'],
        ['dpr.name', 'departmentName'],
        ['epl.name', 'employeeName'],
      );
      qb.leftJoin((e) => e.branch, 'brc');
      qb.leftJoin((e) => e.department, 'dpr');
      qb.leftJoin((e) => e.employee, 'epl');
      qb.andWhere(
        (e) => e.isDeleted,
        (v) => v.isFalse(),
      );

      const downPay = await qb.exec();
      return new DownPaymentsWithPaginationResponse(downPay, params);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async showOne(id: string): Promise<ShowDownPaymentResponse> {
    try {
      const downPay = await this.downPayEntity.findOne({
        where: { id, isDeleted: false },
        relations: [
          'branch',
          'employee',
          'department',
          'histories',
          'histories.createUser',
        ],
      });

      return new ShowDownPaymentResponse(downPay);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async createDownPayment(
    payload: CreateDownPaymentDTO,
  ): Promise<DownPaymentResponse> {
    try {
      const create = await getManager().transaction(async (manager) => {
        const date = new Date(payload.transactionDate),
          month = date.getMonth() + 1,
          year = date.getFullYear();

        const periodEntity = manager.getRepository<Period>(Period);
        const period = await periodEntity.findOne({
          month,
          year,
          isDeleted: false,
        });

        console.log(date, month, year, period);
        if (!period || (period && period.state === PeriodState.CLOSE)) {
          throw new BadRequestException(
            `Failed create due period already closed!`,
          );
        }

        if (payload && !payload.number) {
          payload.number = GenerateCode.downPayment();
        }

        const user = await this.getUser(true);
        const branchId = user && user.branches && user.branches[0].id;

        const downPayment = new DownPayment();
        downPayment.createUser = user;
        downPayment.updateUser = user;
        downPayment.branchId = branchId;
        downPayment.state = DownPaymentState.DRAFT;
        downPayment.type = payload.type;
        downPayment.periodId = period.id;
        downPayment.amount = payload.amount;
        downPayment.number = payload.number;
        downPayment.employeeId = payload.employeeId;
        downPayment.paymentType = payload.paymentType;
        downPayment.description = payload.description;
        downPayment.departmentId = payload.departmentId;
        downPayment.destinationPlace = payload.destinationPlace;
        downPayment.transactionDate = payload.transactionDate;

        const result = await this.downPayEntity.save(downPayment);

        await this.createHistory(downPayment, {
          state: DownPaymentState.DRAFT,
          downPaymentId: result.id,
        });

        return result;
      });

      return new DownPaymentResponse(create);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async approveDownPayment(downPaymentId: string, payload: ApproveDownPaymentDTO,): Promise<any> {
    try {
      const approve = await getManager().transaction(async (manager) => {
        const downPayment = await manager.findOne(DownPayment, {
          where: { id: downPaymentId, isDeleted: false },
          relations: ['branch', 'employee', 'department', 'histories'],
        });
        if (!downPayment)
          throw new NotFoundException(
            `Down Payment ID ${downPaymentId} not found!`,
          );

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name;

        let state: DownPaymentState;
        let isCreateJurnal = false;
        const currentState = downPayment.state;

        if (userRole === MASTER_ROLES.PIC_HO) {
          if (currentState === DownPaymentState.APPROVED_BY_PIC_HO ||currentState === DownPaymentState.APPROVED_BY_SS_SPV) {
            throw new BadRequestException( `Can't approve down payment with current state ${currentState}`);
          }

          state = DownPaymentState.APPROVED_BY_PIC_HO;
          isCreateJurnal = true;

        } else if (userRole === MASTER_ROLES.SS_HO || userRole === MASTER_ROLES.SPV_HO) {
          if (currentState === DownPaymentState.APPROVED_BY_SS_SPV) {
            throw new BadRequestException(`Can't approve down payment with current state ${currentState}`);
          }

          state = DownPaymentState.APPROVED_BY_SS_SPV;
          isCreateJurnal = true;
        }

        if (!state) throw new BadRequestException(`Failed to approve down payment due unknown user role!`);

        downPayment.state = state;
        downPayment.amount = payload.amount;
        downPayment.paymentType = payload.paymentType;

        const result = await manager.save(downPayment);

        if (isCreateJurnal) {
          // Create Journal for PIC HO OR for SS/SPV HO
          await this.removeJournal(manager, result);
          await this.createJournal(manager, downPaymentId);
        }

        await this.createHistory(downPayment, {
          state,
          downPaymentId: result.id,
        });

        return result;
      });

      return new DownPaymentResponse(approve);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async rejectDownPayment(
    id: string,
    payload: RejectDownPaymentDTO,
  ): Promise<any> {
    try {
      const reject = await getManager().transaction(async (manager) => {
        const downPayment = await manager.findOne(DownPayment, {
          where: { id, isDeleted: false },
          relations: ['branch', 'employee', 'department', 'histories'],
        });
        if (!downPayment)
          throw new NotFoundException(`Down payment ID ${id} not found!`);

        if (downPayment.state === DownPaymentState.REJECTED) {
          throw new BadRequestException(`Down payment already rejected!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
        const userRole = user?.role?.name as MASTER_ROLES;

        if (
          ![
            MASTER_ROLES.PIC_HO,
            MASTER_ROLES.SS_HO,
            MASTER_ROLES.SPV_HO,
            MASTER_ROLES.SUPERUSER,
          ].includes(userRole)
        ) {
          throw new BadRequestException(
            `Only PIC/SS/SPV HO can reject down payment!`,
          );
        }

        const state = DownPaymentState.REJECTED;
        downPayment.state = state;
        // downPayment.updateUser = user

        // Remove journal if state in draft, otherwise throw error
        await this.removeJournal(manager, downPayment);
        // retrun result
        const result = await manager.save(downPayment);

        await this.createHistory(downPayment, {
          state,
          downPaymentId: result.id,
          rejectedNote: payload.rejectedNote,
        });

        return result;
      });

      return new DownPaymentResponse(reject);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createHistory(
    downPayment: DownPayment,
    data?: {
      state: DownPaymentState;
      downPaymentId: string;
      rejectedNote?: string;
    },
  ): Promise<DownPaymentHistory[]> {
    try {
      const history = new DownPaymentHistory();
      history.state = data.state;
      history.downPaymentId = data.downPaymentId;
      history.rejectedNote = data.rejectedNote;
      history.createUser = await this.getUser(true);
      history.updateUser = await this.getUser(true);

      await this.historyDownPayEntity.save(history);

      const mergeHistory = [].concat(downPayment.histories, [
        history,
      ]) as DownPaymentHistory[];

      return mergeHistory.filter((v) => v);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async removeJournal(
    manager: EntityManager,
    data: DownPayment,
  ): Promise<any> {
    try {
      const jurnalEntity = manager.getRepository<Journal>(Journal);

      const journal = await jurnalEntity.find({
        sourceType: JournalSourceType.DP,
        reference: data.number,
      });
      const nonDraftJournal =
        journal.length > 0
          ? journal.filter((v) => v.state !== JournalState.DRAFT)
          : [];

      if (nonDraftJournal.length > 0) {
        throw new BadRequestException(
          `Can't remove journal because there are any journal entries with state not draft!`,
        );
      }

      return await jurnalEntity.delete({
        sourceType: JournalSourceType.DP,
        reference: data.number,
      });
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createJournal(
    manager: EntityManager,
    downPayId: string,
  ): Promise<any> {
    try {
      const jurnalEntity = manager.getRepository<Journal>(Journal);
      const periodEntity = manager.getRepository<Period>(Period);

      const downPayment = await manager.findOne(DownPayment, {
        where: { id: downPayId, isDeleted: false },
        relations: ['branch'],
      });
      const period = await periodEntity.findOne({
        id: downPayment.periodId,
        isDeleted: false,
      });

      if (!period || (period && period.state === PeriodState.CLOSE)) {
        throw new BadRequestException(
          `Failed create journal due period already closed!`,
        );
      }

      const user = await this.getUser();
      const jrnl = new Journal();

      jrnl.createUser = user;
      jrnl.updateUser = user;
      jrnl.sourceType = JournalSourceType.DP;
      jrnl.reference = downPayment.number;
      jrnl.branchId = downPayment.branchId;
      jrnl.periodId = downPayment.periodId;
      jrnl.totalAmount = downPayment.amount;
      jrnl.transactionDate = downPayment.transactionDate;
      jrnl.number = GenerateCode.journal(downPayment.transactionDate);
      jrnl.branchCode = downPayment?.branch?.branchCode ?? 'NO_BRANCH_CODE';

      const result = await jurnalEntity.save(jrnl);

      await this.createJournalItemDebit(manager, downPayment, result.id);
      await this.createJournalItemCredit(manager, downPayment, result.id);

      return result;
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createJournalItemDebit(
    manager: EntityManager,
    downPayment: DownPayment,
    jurnalId: string,
  ): Promise<JournalItem> {
    try {
      const jurnalItemEntity = manager.getRepository<JournalItem>(JournalItem);
      const globalSettingEntity = manager.getRepository<GlobalSetting>(
        GlobalSetting,
      );

      const globalSetting = await globalSettingEntity.findOne();
      const user = await this.getUser(true);
      const jrnlItem = new JournalItem();

      const branchId = user && user.branches && user.branches[0].id;
      let coaId;

      if (downPayment.type == DownPaymentType.PERDIN) {
        coaId = globalSetting && globalSetting.downPaymentPerdinCoaId;
      } else if (downPayment.type == DownPaymentType.REIMBURSEMENT) {
        coaId = globalSetting && globalSetting.downPaymentReimbursementCoaId;
      }

      jrnlItem.createUser = user;
      jrnlItem.updateUser = user;
      jrnlItem.coaId = coaId;
      jrnlItem.branchId = branchId;
      jrnlItem.journalId = jurnalId;
      jrnlItem.debit = downPayment.amount;
      jrnlItem.reference = downPayment.number;
      jrnlItem.periodId = downPayment.periodId;
      jrnlItem.transactionDate = downPayment.transactionDate;

      return await jurnalItemEntity.save(jrnlItem);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async createJournalItemCredit(
    manager: EntityManager,
    downPayment: DownPayment,
    jurnalId: string,
  ): Promise<JournalItem> {
    try {
      const jurnalItemEntity = manager.getRepository<JournalItem>(JournalItem);
      const branchEntity = manager.getRepository<Branch>(Branch);

      const user = await this.getUser(true);
      const branchId = user && user.branches && user.branches[0].id;

      const branch = await branchEntity.findOne({ id: branchId });
      const jrnlItem = new JournalItem();

      jrnlItem.createUser = user;
      jrnlItem.updateUser = user;
      jrnlItem.branchId = branchId;
      jrnlItem.journalId = jurnalId;
      jrnlItem.coaId = branch.cashCoaId;
      jrnlItem.credit = downPayment.amount;
      jrnlItem.reference = downPayment.number;
      jrnlItem.periodId = downPayment.periodId;
      jrnlItem.transactionDate = downPayment.transactionDate;

      return await jurnalItemEntity.save(jrnlItem);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
