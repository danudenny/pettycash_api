import { InjectRepository } from '@nestjs/typeorm';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';
import { getManager, Repository } from 'typeorm';
import { AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response/response.dto';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/dto/allocation-balance.query.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CashBalanceAllocationState, MASTER_ROLES } from '../../../model/utils/enum';
import { AccountStatementHistory } from '../../../model/account-statement-history.entity';
import { RejectAllocationDTO } from '../../domain/allocation-balance/dto/allocation-balance.dto';
import dayjs from 'dayjs';
import { TransferBalanceDTO } from '../../domain/balance/transfer-balance.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { AllocationBalanceDetailResponse } from '../../domain/allocation-balance/dto/allocation-balance-detail.dto';
import { CreateAllocationBalanceOdooDTO } from '../../domain/allocation-balance/dto/allocation-balance-odoo-create.dto';
import { CashBalanceAllocationOdoo } from '../../../model/cash.balance.allocation-odoo.entity';
import { RevisionAllocationBalanceDTO } from '../../domain/allocation-balance/dto/allocation-balance-revision.dto';

@Injectable()
export class AllocationBalanceService {

  constructor(
    @InjectRepository(CashBalanceAllocation)
    private readonly cashbalRepo: Repository<CashBalanceAllocation>,
    @InjectRepository(AccountStatementHistory)
    private readonly accHistoryRepo: Repository<AccountStatementHistory>,
    @InjectRepository(CashBalanceAllocationOdoo)
    private readonly odooRepo: Repository<CashBalanceAllocationOdoo>
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
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
  ): Promise<AccountStatementHistory[]> {
    const newHistory = new AccountStatementHistory();
    const userResponsible = await this.getUser();
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.createUserId = userResponsible.id;
    newHistory.updateUserId = userResponsible.id;
    newHistory.accountStatementId = allocation.id;

    const history = [].concat(allocation.allocationHistory, [
      newHistory,
    ]) as AccountStatementHistory[];
    return history.filter((v) => v);
  }

  public async list(
    query: AllocationBalanceQueryDTO,
  ): Promise<AllocationBalanceWithPaginationResponse> {
    const params = { order: '^number', limit: 10, ...query };
    const qb = new QueryBuilder(CashBalanceAllocation, 'cba', params);

    qb.fieldResolverMap['createdDate'] = 'cba.createdDate';
    qb.fieldResolverMap['branchId'] = 'cba.branchId';
    qb.fieldResolverMap['state'] = 'cba.state';
    qb.fieldResolverMap['number__contains'] = 'cba.number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['cba.id', 'id'],
      ['br.branch_name', 'branchName'],
      ['cba.number', 'number'],
      ['cba.amount', 'amount'],
      ['us.first_name', 'picName'],
      ['us.username', 'nik'],
      ['cba.state', 'state'],
      ['cba.received_date', 'receivedDate'],
      ['us.first_name', 'receivedUserName'],
    );
    qb.leftJoin(
      (e) => e.branch,
      'br'
    );
    qb.leftJoin(
      (e) => e.responsibleUser,
      'us'
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const allocationBalance = await qb.exec();
    return new AllocationBalanceWithPaginationResponse(allocationBalance)
  }

  public async getById(id: string): Promise<AllocationBalanceDetailResponse> {
    const allocation = await this.cashbalRepo.findOne({
      where: { id, isDeleted: false },
      relations: [
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

  public async transfer(
    data: TransferBalanceDTO
  ): Promise<any> {
    const transferDto = await this.cashbalRepo.create(data);
    const userResponsible = await this.getUser();
    let state: CashBalanceAllocationState;
    transferDto.createUserId = userResponsible.id;
    transferDto.updateUserId = userResponsible.id;
    transferDto.number = GenerateCode.transferBalance();
    transferDto.state = CashBalanceAllocationState.DRAFT;

    if(!transferDto.amount) {
      throw new BadRequestException(
        `Nominal tidak boleh kosong!`,
      );
    }

    state = transferDto.state


    try {
      const transfer = await this.cashbalRepo.save(transferDto);
      if(transfer) {
        transferDto.allocationHistory = await this.buildHistory(transferDto, { state });
        await this.accHistoryRepo.save(transferDto.allocationHistory);
      }
      return transfer;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async revision(
    id: string,
    data: RevisionAllocationBalanceDTO
  ): Promise<any> {
    const idCba = await this.cashbalRepo.findOne({
      where: {
        id: id,
        isDeleted: false,
        state: CashBalanceAllocationState.REJECTED
      }
    })

    if (!idCba) {
      throw new BadRequestException('Alokasi Saldo Kas dengan status Rejected tidak ditemukan ')
    }

    const userResponsible = await this.getUser();
    const revised = this.cashbalRepo.create(data);
    revised.updateUserId = userResponsible.id;
    revised.state = CashBalanceAllocationState.DRAFT;
    revised.id = id;

    const state = revised.state;
    try {
      const revision =  await this.cashbalRepo.update(id, revised);
      if (revision) {
        revised.allocationHistory = await this.buildHistory(revised, { state });
        await this.accHistoryRepo.save(revised.allocationHistory);
        throw new HttpException('Sukses Revisi Alokasi Saldo Kas', HttpStatus.OK);
      }
    } catch (err) {
      throw err;
    }
  }

  public async approve(
    id: string,
    payload?: CreateAllocationBalanceOdooDTO
  ): Promise<any> {
    const approveAllocation = await getManager().transaction(async (manager) => {
      const allocation = await manager.findOne(CashBalanceAllocation, {
        where: { id: id, isDeleted: false },
        relations: ['allocationHistory', 'destinationBank', 'branch'],
      });
      if (!allocation) {
        throw new NotFoundException(`Alokasi ID ${id} tidak ditemukan!`);
      }

      const user = await AuthService.getUser({ relations: ['role'] });
      const userRole = user?.role?.name;

      // TODO: Implement State Machine for approval flow?
      let state: CashBalanceAllocationState;
      const currentState = allocation.state;
      if (
        currentState === CashBalanceAllocationState.RECEIVED
      ) {
        throw new BadRequestException(
          `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo sudah diterima oleh Admin Branch`,
        );
      }
      if (userRole === MASTER_ROLES.SS_HO) {
        if (
          currentState === CashBalanceAllocationState.EXPIRED
        ) {
          throw new BadRequestException(
            `Tanggal transfer sudah expired`,
          );
        }
        if (
          currentState === CashBalanceAllocationState.APPROVED_BY_SS
        ) {
          throw new BadRequestException(
            `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}`,
          );
        }
        if (
          currentState === CashBalanceAllocationState.APPROVED_BY_SPV
        ) {
          throw new BadRequestException(
            `Alokasi Saldo Kas sudah diapprove oleh ${currentState}, dan ${CashBalanceAllocationState.APPROVED_BY_SS} tidak bisa melakukan approval.`,
          );
        }
        state = CashBalanceAllocationState.APPROVED_BY_SS;
      }

      if (userRole === MASTER_ROLES.SPV_HO) {

        if (currentState === CashBalanceAllocationState.DRAFT) {
          throw new BadRequestException(
            `Alokasi Saldo Kas belum diapprove oleh SS HO`,
          );
        }
        if (currentState === CashBalanceAllocationState.APPROVED_BY_SPV) {
          throw new BadRequestException(
            `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}`,
          );
        }
        if (currentState === CashBalanceAllocationState.EXPIRED) {
          throw new BadRequestException(
            `Tanggal transfer sudah expired`,
          );
        }

        const createOdoo = this.odooRepo.create(payload);
        const userResponsible = await this.getUser();
        createOdoo.createUserId = userResponsible.id;
        createOdoo.updateUserId = userResponsible.id;
        createOdoo.accountNumber = allocation.destinationBank.accountNumber;
        createOdoo.amount = allocation.amount;
        createOdoo.number = allocation.number;
        createOdoo.branchName = allocation.branch.branchName;
        createOdoo.description = allocation.description;
        createOdoo.authKey = "2ee2cec3302e26b8030b233d614c4f4e";
        createOdoo.analyticAccount = allocation.branch.branchCode;

        state = CashBalanceAllocationState.APPROVED_BY_SPV;
        if (state == CashBalanceAllocationState.APPROVED_BY_SPV) {
          await this.odooRepo.save(createOdoo)
        }
      }

      if (dayjs(allocation.transferDate).format('YYYY-MM-DD') < dayjs(new Date).format('YYYY-MM-DD')) {
        try {
          state = CashBalanceAllocationState.EXPIRED;
        } catch {
          throw new BadRequestException(
            `Tanggal transfer sudah expired`,
          );
        }
      }

      if (!state) {
        throw new BadRequestException(
          `Gagal approve Alokasi Saldo Kas karena User Role tidak diketahui!`,
        );
      }

      allocation.state = state;
      allocation.allocationHistory = await this.buildHistory(allocation, { state });
      await this.accHistoryRepo.save(allocation.allocationHistory);
      return await manager.save(allocation);
    });
    return approveAllocation;
  }

  public async reject(
    id: string,
    payload?: RejectAllocationDTO,
  ): Promise<CashBalanceAllocation> {
    try {
      const rejectAllocation = await getManager().transaction(async (manager) => {
        const allocation = await manager.findOne(CashBalanceAllocation, {
          where: { id: id, isDeleted: false },
          relations: ['allocationHistory'],
        });
        if (!allocation) {
          throw new NotFoundException(`Alokasi Saldo Kas ID ${id} tidak ditemukan!`);
        }

        if (
          allocation.state === CashBalanceAllocationState.EXPIRED
        ) {
          throw new BadRequestException(
            `Tanggal transfer sudah expired`,
          );
        }

        if (allocation.state === CashBalanceAllocationState.RECEIVED) {
          throw new BadRequestException(
            `Tidak bisa menolak Alokasi Saldo Kas , Alokasi saldo sudah diterima oleh Admin Branch`
          );
        }

        if (allocation.state === CashBalanceAllocationState.REJECTED) {
          throw new UnprocessableEntityException(`Alokasi Saldo Kas sudah di tolak!`);
        }

        const user = await AuthService.getUser({ relations: ['role'] });
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
            MASTER_ROLES.SPV_HO,
            MASTER_ROLES.SUPERUSER,
          ].includes(userRole)
        ) {
          throw new BadRequestException(
            `Hanya PIC/SS/SPV HO yang dapat menolak Alokasi Saldo Kas!`,
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
      });
      return rejectAllocation;
    } catch (error) {
      throw error;
    }
  }

  public async received(id: string): Promise<any> {
    const userResponsible = await this.getUser();
    const approveAllocation = await getManager().transaction(async (manager) => {
      const allocation = await manager.findOne(CashBalanceAllocation, {
        where: { id: id, isDeleted: false },
        relations: ['allocationHistory'],
      });
      if (!allocation) {
        throw new NotFoundException(`Alokasi ID ${id} tidak ditemukan!`);
      }

      const user = await AuthService.getUser({ relations: ['role'] });
      const userRole = user?.role?.name;

      // TODO: Implement State Machine for approval flow?
      let state: CashBalanceAllocationState;
      const currentState = allocation.state;
      if (userRole === MASTER_ROLES.ADMIN_BRANCH) {
        if (
          currentState === CashBalanceAllocationState.EXPIRED
        ) {
          throw new BadRequestException(
            `Tanggal transfer sudah expired`,
          );
        }
        if (
          currentState === CashBalanceAllocationState.DRAFT
        ) {
          throw new BadRequestException(
            `Tidak bisa terima Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo harus diapprove oleh SS HO`,
          );
        }

        if (
          currentState === CashBalanceAllocationState.REJECTED
        ) {
          throw new BadRequestException(
            `Tidak bisa terima Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo sudah di tolak`,
          );
        }

        if (
          currentState === CashBalanceAllocationState.APPROVED_BY_SS
        ) {
          throw new BadRequestException(
            `Tidak bisa terima Alokasi Saldo Kas dengan status ${currentState}, Alokasi saldo harus diapprove oleh spv HO`,
          );
        }
        state = CashBalanceAllocationState.RECEIVED;
      }

      if (!state) {
        throw new BadRequestException(
          `Gagal terima Alokasi Saldo Kas karena User Role tidak diketahui!`,
        );
      }

      allocation.state = state;
      allocation.receivedDate = new Date();
      allocation.receivedUserId = userResponsible.id;
      allocation.allocationHistory = await this.buildHistory(allocation, { state });
      await this.accHistoryRepo.save(allocation.allocationHistory);
      return await manager.save(allocation);
    });
    return approveAllocation;
  }
}
