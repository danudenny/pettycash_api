import { Branch } from './../../../model/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';
import {
  EntityManager,
  getManager,
  Repository,
  createQueryBuilder,
} from 'typeorm';
import { AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response/response.dto';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/dto/allocation-balance.query.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AccountStatementAmountPosition,
  AccountStatementType,
  CashBalanceAllocationState,
  JournalSourceType,
  JournalState,
  MASTER_ROLES,
  PeriodState,
} from '../../../model/utils/enum';
import {
  PaidAllocationDTO,
  RejectAllocationDTO,
} from '../../domain/allocation-balance/dto/allocation-balance.dto';
import dayjs from 'dayjs';
import { TransferBalanceDTO } from '../../domain/balance/transfer-balance.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { AllocationBalanceDetailResponse } from '../../domain/allocation-balance/dto/allocation-balance-detail.dto';
import { RevisionAllocationBalanceDTO } from '../../domain/allocation-balance/dto/allocation-balance-revision.dto';
import { AccountStatement } from '../../../model/account-statement.entity';
import { CreateAllocationBalanceDto } from '../../domain/allocation-balance/dto/create-allocation-balance.dto';
import { Journal } from '../../../model/journal.entity';
import { Period } from '../../../model/period.entity';
import { JournalItem } from '../../../model/journal-item.entity';
import { User } from '../../../model/user.entity';
import { ReceivedAllocationBalanceDTO } from '../../domain/allocation-balance/dto/allocation-received.dto';
import { AccountStatementService } from './account-statement.service';
import { CashBalanceAllocationHistory } from '../../../model/cash.balance.allocation-history.entity';

@Injectable()
export class AllocationBalanceService {
  constructor(
    @InjectRepository(CashBalanceAllocation)
    private readonly cashbalRepo: Repository<CashBalanceAllocation>,
    @InjectRepository(CashBalanceAllocationHistory)
    private readonly accHistoryRepo: Repository<CashBalanceAllocationHistory>,
    @InjectRepository(Period)
    private readonly periodRepo: Repository<Period>,
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUserBranches();
    } else {
      return await AuthService.getUser();
    }
  }

  private async buildHistory(
    allocation: CashBalanceAllocation,
    data?: {
      state: CashBalanceAllocationState;
      rejectedNote?: string;
    },
  ): Promise<CashBalanceAllocationHistory[]> {
    const newHistory = new CashBalanceAllocationHistory();
    const userResponsible = await this.getUser();
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.createUserId = userResponsible.id;
    newHistory.updateUserId = userResponsible.id;
    newHistory.accountStatementId = allocation.id;

    const history = [].concat(allocation.allocationHistory, [
      newHistory,
    ]) as CashBalanceAllocationHistory[];
    return history.filter((v) => v);
  }

  private async buildAccountStatement(
    cashBal: CashBalanceAllocation,
  ): Promise<AccountStatement> {
    const userResponsible = await this.getUser();
    const stmt = new AccountStatement();
    stmt.branchId = cashBal.branchId;
    stmt.createUserId = userResponsible.id;
    stmt.updateUserId = userResponsible.id;
    stmt.reference = cashBal.number;
    stmt.amount = cashBal.amount;
    stmt.transactionDate = cashBal.transferDate;
    stmt.type = AccountStatementType.BANK;
    stmt.amountPosition = AccountStatementAmountPosition.CREDIT;

    return stmt;
  }

  private async upsertAccountStatementFromExpense(
    manager: EntityManager,
    cashBal: CashBalanceAllocation,
  ): Promise<AccountStatement> {
    // delete existing statement
    await AccountStatementService.deleteAndUpdateBalance(
      {
        where: {
          reference: cashBal?.number,
          branchId: cashBal?.branchId,
          isDeleted: false,
        },
      },
      manager,
    );

    // insert statement
    const stmt = await this.buildAccountStatement(cashBal);
    return await AccountStatementService.createAndUpdateBalance(stmt, manager);
  }

  public async list(
    query: AllocationBalanceQueryDTO,
  ): Promise<AllocationBalanceWithPaginationResponse> {
    const params = { order: '^createdAt', limit: 10, ...query };
    const qb = new QueryBuilder(CashBalanceAllocation, 'cba', params);
    const { userBranchIds, isSuperUser } =
      await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['receivedDate'] = 'cba.received_date';
    qb.fieldResolverMap['branchId'] = 'cba.branchId';
    qb.fieldResolverMap['state'] = 'cba.state';
    qb.fieldResolverMap['number__contains'] = 'cba.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['cba.id', 'id'],
      ['cba.created_at', 'createdAt'],
      ['br.branch_name', 'branchName'],
      ['cba.number', 'number'],
      ['cba.amount', 'amount'],
      ["us.first_name || '' || COALESCE(' ' || us.last_name, '')", 'picName'],
      ['us.username', 'nik'],
      ['cba.state', 'state'],
      ['cba.received_date', 'receivedDate'],
      ['cba.is_paid', 'isPaid'],
      [
        "ru.first_name || ' ' || COALESCE(' ' || ru.last_name, '')",
        'receivedUserName',
      ],
    );
    qb.leftJoin((e) => e.branch, 'br');
    qb.leftJoin((e) => e.responsibleUser, 'us');
    qb.leftJoin((e) => e.receivedUser, 'ru');
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

    console.log(qb.getSql());

    const allocationBalance = await qb.exec();

    return new AllocationBalanceWithPaginationResponse(
      allocationBalance,
      params,
    );
  }

  public async getById(id: string): Promise<AllocationBalanceDetailResponse> {
    const where = { id, isDeleted: false };
    const allocation = await this.cashbalRepo.findOne({
      where,
      relations: [
        'cashflowType',
        'branch',
        'responsibleUser',
        'receivedUser',
        'allocationHistory',
        'destinationBank',
        'allocationHistory.createUser',
      ],
    });

    if (!allocation) {
      throw new NotFoundException(`Allocation ID ${id} not found!`);
    }
    return new AllocationBalanceDetailResponse(allocation);
  }

  public async transfer(data: TransferBalanceDTO): Promise<any> {
    const transferDto = await this.cashbalRepo.create(data);
    const userResponsible = await this.getUser();
    let state: CashBalanceAllocationState;
    transferDto.createUserId = userResponsible.id;
    transferDto.updateUserId = userResponsible.id;
    transferDto.number = GenerateCode.transferBalance();
    transferDto.state = CashBalanceAllocationState.DRAFT;

    if (!transferDto.amount) {
      throw new BadRequestException(`Nominal tidak boleh kosong!`);
    }

    state = transferDto.state;

    try {
      const transfer = await this.cashbalRepo.save(transferDto);
      if (transfer) {
        transferDto.allocationHistory = await this.buildHistory(transferDto, {
          state,
        });
        await this.accHistoryRepo.save(transferDto.allocationHistory);
      }
      return transfer;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async revision(
    id: string,
    data: RevisionAllocationBalanceDTO,
  ): Promise<any> {
    const idCba = await this.cashbalRepo.findOne({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!idCba) {
      throw new BadRequestException(
        'Alokasi Saldo Kas dengan status Rejected tidak ditemukan ',
      );
    }

    const userResponsible = await this.getUser();
    const revised = this.cashbalRepo.create(data);
    revised.updateUserId = userResponsible.id;
    revised.state = CashBalanceAllocationState.DRAFT;
    revised.id = id;

    const state = revised.state;
    const currentState = idCba.state;
    try {
      const revision = await this.cashbalRepo.update(id, revised);
      if (revision) {
        if (currentState !== CashBalanceAllocationState.DRAFT) {
          revised.allocationHistory = await this.buildHistory(revised, {
            state,
          });
          await this.accHistoryRepo.save(revised.allocationHistory);
        }
        throw new HttpException(
          'Sukses Revisi Alokasi Saldo Kas',
          HttpStatus.OK,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  public async approve(id: string): Promise<any> {
    const approveAllocation = await getManager().transaction(
      async (manager) => {
        const allocation = await manager.findOne(CashBalanceAllocation, {
          where: { id, isDeleted: false },
          relations: ['allocationHistory', 'destinationBank', 'branch'],
        });
        if (!allocation) {
          throw new NotFoundException(`Alokasi ID ${id} tidak ditemukan!`);
        }

        const user = await AuthService.getUserRole();
        const userRole = user?.role?.name;

        // TODO: Implement State Machine for approval flow?
        let state: CashBalanceAllocationState;
        const currentState = allocation.state;
        if (currentState === CashBalanceAllocationState.RECEIVED) {
          throw new BadRequestException(
            `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}, Dana sudah diterima oleh Admin Branch`,
          );
        }

        // ! HINT: Approve by SS HO
        if (userRole === MASTER_ROLES.SS_HO) {
          if (
            dayjs(allocation.transferDate).format('YYYY-MM-DD') <
            dayjs(new Date()).format('YYYY-MM-DD')
          ) {
            state = CashBalanceAllocationState.EXPIRED;
          }

          if (currentState === CashBalanceAllocationState.REJECTED) {
            throw new BadRequestException(`Alokasi Saldo Kas sudah di tolak`);
          }
          if (currentState === CashBalanceAllocationState.CANCELED) {
            throw new BadRequestException(
              `Alokasi Saldo Kas sudah di batalkan`,
            );
          }
          if (currentState === CashBalanceAllocationState.APPROVED_BY_SS) {
            throw new BadRequestException(
              `Tidak bisa konfirmasi Alokasi Saldo Kas dengan status ${currentState}`,
            );
          }

          state = CashBalanceAllocationState.APPROVED_BY_SS;
        }

        if (!state) {
          throw new BadRequestException(
            `Gagal approve Alokasi Saldo Kas karena User Role tidak diketahui!`,
          );
        }

        allocation.state = state;
        allocation.allocationHistory = await this.buildHistory(allocation, {
          state,
        });
        await this.accHistoryRepo.save(allocation.allocationHistory);
        return await manager.save(allocation);
      },
    );
    if (approveAllocation['state'] === 'approved_by_ss_ho') {
      throw new HttpException(`Approve dari SS HO`, HttpStatus.OK);
    }
    if (approveAllocation['state'] === CashBalanceAllocationState.EXPIRED) {
      throw new HttpException(
        `Form yang telah lewat batas tanggal transfer`,
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  public async reject(
    id: string,
    payload?: RejectAllocationDTO,
  ): Promise<CashBalanceAllocation> {
    try {
      const rejectAllocation = await getManager().transaction(
        async (manager) => {
          const allocation = await manager.findOne(CashBalanceAllocation, {
            where: { id, isDeleted: false },
            relations: ['allocationHistory'],
          });
          if (!allocation) {
            throw new NotFoundException(
              `Alokasi Saldo Kas ID ${id} tidak ditemukan!`,
            );
          }

          if (allocation.state === CashBalanceAllocationState.RECEIVED) {
            throw new BadRequestException(
              `Tidak bisa menolak Alokasi Saldo Kas , Alokasi saldo sudah diterima oleh Admin Branch`,
            );
          }

          if (allocation.state === CashBalanceAllocationState.REJECTED) {
            throw new UnprocessableEntityException(
              `Alokasi Saldo Kas sudah di tolak!`,
            );
          }

          const user = await AuthService.getUserRole();
          const userRole = user?.role?.name as MASTER_ROLES;

          if (!userRole) {
            throw new BadRequestException(
              `Gagal menolak Alokasi Saldo Kas karena user role tidak diketahui!`,
            );
          }

          if (
            ![
              MASTER_ROLES.PIC_HO,
              MASTER_ROLES.SS_HO,
              MASTER_ROLES.SUPERUSER,
            ].includes(userRole)
          ) {
            throw new BadRequestException(
              `Hanya PIC/SS yang dapat menolak Alokasi Saldo Kas!`,
            );
          }

          const { rejectedNote } = payload;
          const state = CashBalanceAllocationState.REJECTED;

          allocation.state = state;
          allocation.allocationHistory = await this.buildHistory(allocation, {
            state,
            rejectedNote,
          });
          await this.accHistoryRepo.save(allocation.allocationHistory);
          return await manager.save(allocation);
        },
      );
      throw new HttpException(`Konfirmasi Tidak Setuju`, HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  public async cancel(id: string): Promise<CashBalanceAllocation> {
    try {
      const cancelAllocation = await getManager().transaction(
        async (manager) => {
          const allocation = await manager.findOne(CashBalanceAllocation, {
            where: { id, isDeleted: false },
            relations: ['allocationHistory'],
          });
          if (!allocation) {
            throw new NotFoundException(
              `Alokasi Saldo Kas ID ${id} tidak ditemukan!`,
            );
          }

          if (allocation.state === CashBalanceAllocationState.RECEIVED) {
            throw new BadRequestException(
              `Tidak bisa membatalkan Alokasi Saldo Kas , Alokasi saldo sudah diterima oleh Admin Cabang`,
            );
          }

          if (allocation.state === CashBalanceAllocationState.CANCELED) {
            throw new UnprocessableEntityException(
              `Alokasi Saldo Kas sudah di batalkan!`,
            );
          }

          const user = await AuthService.getUserRole();
          const userRole = user?.role?.name as MASTER_ROLES;

          if (!userRole) {
            throw new BadRequestException(
              `Gagal membatalkan Alokasi Saldo Kas karena user role tidak diketahui!`,
            );
          }

          if (
            ![
              MASTER_ROLES.ADMIN_BRANCH,
              MASTER_ROLES.PIC_HO,
              MASTER_ROLES.SUPERUSER,
            ].includes(userRole)
          ) {
            throw new BadRequestException(
              `Hanya PIC HO / Admin yang dapat membatalkan Alokasi Saldo Kas!`,
            );
          }

          const state = CashBalanceAllocationState.CANCELED;

          allocation.state = state;
          allocation.allocationHistory = await this.buildHistory(allocation, {
            state,
          });
          await this.accHistoryRepo.save(allocation.allocationHistory);
          return await manager.save(allocation);
        },
      );
      throw new HttpException(`Form Dibatalkan`, HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  public async received(
    id: string,
    payload: ReceivedAllocationBalanceDTO,
  ): Promise<any> {
    const userResponsible = await this.getUser();
    const approveAllocation = await getManager().transaction(
      async (manager) => {
        const allocation = await manager.findOne(CashBalanceAllocation, {
          where: { id, isDeleted: false },
          relations: ['allocationHistory'],
        });
        if (!allocation) {
          throw new NotFoundException(`Alokasi ID ${id} tidak ditemukan!`);
        }

        if (!allocation.branchId) {
          throw new NotFoundException(`Cabang Tidak Ditemukan.`);
        }

        const getBranchID = await Branch.findOne({
          where: {
            id: allocation.branchId,
          },
          select: ['id', 'cashCoaId'],
        });

        if (getBranchID.cashCoaId == null) {
          throw new NotFoundException(`Cash Coa Cabang Tidak Ditemukan.`);
        }

        const user = await AuthService.getUserRole();
        const userRole = user?.role?.name as MASTER_ROLES;

        // TODO: Implement State Machine for approval flow?
        let state: CashBalanceAllocationState;
        const currentState = allocation.state;
        if (
          userRole === MASTER_ROLES.PIC_HO ||
          userRole === MASTER_ROLES.SUPERUSER
        ) {
          if (currentState === CashBalanceAllocationState.RECEIVED) {
            throw new BadRequestException(
              `Tidak bisa menerima alokasi saldo kas karena Sudah Diterima oleh ${userRole}`,
            );
          }

          if (currentState === CashBalanceAllocationState.DRAFT) {
            throw new BadRequestException(
              `Tidak bisa terima Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo harus diapprove oleh SS HO`,
            );
          }

          if (currentState === CashBalanceAllocationState.REJECTED) {
            throw new BadRequestException(
              `Tidak bisa terima Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo sudah di tolak`,
            );
          }

          state = CashBalanceAllocationState.RECEIVED;
          await this.upsertAccountStatementFromExpense(manager, allocation);
        }

        if (!state) {
          throw new BadRequestException(
            `Gagal terima Alokasi Saldo Kas karena User Role tidak diketahui!`,
          );
        }

        if (new Date(payload.receivedDate) > new Date()) {
          throw new HttpException(
            'Tidak bisa memilih tanggal setelah hari ini',
            HttpStatus.BAD_REQUEST,
          );
        }

        allocation.state = state;
        allocation.receivedDate = payload.receivedDate;
        allocation.receivedUserId = userResponsible.id;
        try {
          allocation.allocationHistory = await this.buildHistory(allocation, {
            state,
          });
          await this.accHistoryRepo.save(allocation.allocationHistory);
          const saveAllocation = await manager.save(allocation);
          if (saveAllocation) {
            const journal = await this.buildJournal(
              manager,
              id?.toString(),
              userRole,
            );
            return AllocationBalanceService.createJournal(manager, journal);
          }
        } catch (error) {
          throw new HttpException(error.response, error.status);
        }
      },
    );
    throw new HttpException('Dana diterima oleh Admin Branch', HttpStatus.OK);
  }

  public async isPaid(
    number: string,
    payload: PaidAllocationDTO,
  ): Promise<any> {
    const paidDto = await this.cashbalRepo.create(payload);
    const paidAlokasi = await this.cashbalRepo.findOne({
      where: {
        number,
        isDeleted: false,
        isPaid: false,
      },
    });
    let state: CashBalanceAllocationState;

    if (paidAlokasi.state != CashBalanceAllocationState.RECEIVED) {
      throw new HttpException(
        'Gagal Proses Alokasi Saldo Kas',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (!paidAlokasi) {
      throw new HttpException(
        'Nomor Referensi tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    paidDto.isPaid = true;
    paidDto.updatedAt = new Date();
    paidDto.state = CashBalanceAllocationState.PAID;

    state = CashBalanceAllocationState.PAID;

    try {
      await this.cashbalRepo.update(paidAlokasi['id'], paidDto);
      paidAlokasi.allocationHistory = await this.buildHistory(paidAlokasi, {
        state,
      });
      await this.accHistoryRepo.save(paidAlokasi.allocationHistory);
      throw new HttpException(
        'Alokasi saldo kas sudah terbayar',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async create(data: CreateAllocationBalanceDto): Promise<any> {
    const createDto = await this.cashbalRepo.create(data);
    const userResponsible = await this.getUser();
    let state: CashBalanceAllocationState;
    createDto.createUserId = userResponsible.id;
    createDto.updateUserId = userResponsible.id;
    createDto.number = GenerateCode.createBalance();
    createDto.state = CashBalanceAllocationState.DRAFT;

    if (!createDto.amount) {
      throw new BadRequestException(`Nominal tidak boleh kosong!`);
    }

    const user = await AuthService.getUserRole();
    const userRole = user?.role?.name;

    if (userRole === MASTER_ROLES.ADMIN_BRANCH) {
      throw new HttpException(
        'Role ADMIN, tidak dapat membuat Alokasi Saldo',
        HttpStatus.BAD_REQUEST,
      );
    }

    state = createDto.state;

    try {
      const transfer = await this.cashbalRepo.save(createDto);
      if (transfer) {
        createDto.allocationHistory = await this.buildHistory(createDto, {
          state,
        });
        await this.accHistoryRepo.save(createDto.allocationHistory);
      }
      return transfer;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  private static async createJournal(
    manager: EntityManager,
    journal: Journal,
  ): Promise<Journal> {
    const journalRepo = manager.getRepository<Journal>(Journal);
    const periodRepo = manager.getRepository<Period>(Period);
    const period = await periodRepo.findOne({
      where: { id: journal.periodId, isDeleted: false },
    });

    if (!period || (period && period.state === PeriodState.CLOSE)) {
      throw new BadRequestException(
        `Failed create journal due period already closed!`,
      );
    }

    return await journalRepo.save(journal);
  }

  private async buildJournalItemCredit(
    alokasi: CashBalanceAllocation,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const isLedger: boolean = false;

    const getPeriod = await this.periodRepo.findOne({
      where: {
        name: dayjs(new Date()).format('MM-YYYY'),
      },
    });

    if (!alokasi.cashflowType) {
      throw new HttpException(
        'Jenis kas masuk tidak ada',
        HttpStatus.BAD_REQUEST,
      );
    }

    const i = new JournalItem();
    i.createUser = user;
    i.updateUser = user;
    i.coaId = alokasi.cashflowType.coaId;
    i.branchId = alokasi.branchId;
    i.transactionDate = alokasi.receivedDate;
    i.periodId = getPeriod.id;
    i.reference = alokasi.number;
    i.description = alokasi?.description;
    i.isLedger = isLedger;
    i.credit = alokasi.amount;
    items.push(i);

    return items;
  }

  private async buildJournalItemDebit(
    alokasi: CashBalanceAllocation,
    user: User,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const items: JournalItem[] = [];
    const isLedger: boolean = true;

    const getPeriod = await this.periodRepo.findOne({
      where: {
        name: dayjs(new Date()).format('MM-YYYY'),
      },
    });

    const checkCoa = await createQueryBuilder('account_coa', 'coa')
      .select('coa.id')
      .where(`coa.id = '${alokasi?.branch?.cashCoaId}'`)
      .andWhere('coa.isDeleted = false')
      .andWhere('coa.isActive = true')
      .getOne();

    if (checkCoa == null) {
      throw new HttpException(
        'Akun Coa Tidak Ditemukan',
        HttpStatus.BAD_REQUEST,
      );
    }

    const i = new JournalItem();
    i.createUser = user;
    i.updateUser = user;
    i.coaId = alokasi?.branch?.cashCoaId;
    i.branchId = alokasi.branchId;
    i.transactionDate = alokasi.receivedDate;
    i.periodId = getPeriod.id;
    i.reference = alokasi.number;
    i.description = alokasi?.description;
    i.isLedger = isLedger;
    i.debit = alokasi.amount;
    items.push(i);

    return items;
  }

  private async buildJournalItem(
    data: CashBalanceAllocation,
    userRole: MASTER_ROLES,
  ): Promise<JournalItem[]> {
    const user = await this.getUser();
    const debit = await this.buildJournalItemDebit(data, user, userRole);
    const credit = await this.buildJournalItemCredit(data, user, userRole);
    const amountDebit = debit
      .map((m) => Number(m.debit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);
    const amountCredit = credit
      .map((m) => Number(m.credit))
      .filter((i) => i)
      .reduce((a, b) => a + b, 0);

    if (amountDebit !== amountCredit) {
      throw new Error(`Amount debit and credit should equal!`);
    }

    return [...new Set([...debit, ...credit])];
  }

  private async buildJournal(
    manager: EntityManager,
    id: string,
    userRole: MASTER_ROLES,
  ): Promise<Journal> {
    const user = await this.getUser();
    // re-fetch expense to get latest updated ExpenseItems
    const alokasi = await manager.findOne(CashBalanceAllocation, {
      where: { id, isDeleted: false },
      relations: ['branch', 'cashflowType'],
    });
    const getPeriod = await this.periodRepo.findOne({
      where: {
        name: dayjs(new Date()).format('MM-YYYY'),
      },
    });
    const j = new Journal();
    j.createUser = user;
    j.updateUser = user;
    j.branchId = alokasi.branchId;
    j.transactionDate = alokasi.receivedDate;
    j.periodId = getPeriod.id;
    j.number = GenerateCode.journal(alokasi.receivedDate);
    j.reference = alokasi.number;
    j.sourceType = JournalSourceType.ALOKASI;
    j.items = await this.buildJournalItem(alokasi, userRole);
    j.totalAmount = alokasi.amount;
    j.state = JournalState.DRAFT;

    return j;
  }
}
