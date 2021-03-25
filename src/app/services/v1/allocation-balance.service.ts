import { InjectRepository } from '@nestjs/typeorm';
import { CashBalanceAllocation } from '../../../model/cash.balance.allocation.entity';
import { getManager, Repository } from 'typeorm';
import { AllocationBalanceResponse, AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response.dto';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/allocation-balance.query.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CashBalanceAllocationState, MASTER_ROLES } from '../../../model/utils/enum';
import { AccountStatementHistory } from '../../../model/account-statement-history.entity';
import { RejectAllocationDTO } from '../../domain/allocation-balance/allocation-balance.dto';

@Injectable()
export class AllocationBalanceService {

  constructor(
    @InjectRepository(CashBalanceAllocation)
    private readonly cashbalRepo: Repository<CashBalanceAllocation>
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
    newHistory.state = data.state;
    newHistory.rejectedNote = data.rejectedNote;
    newHistory.createUser = await this.getUser();
    newHistory.updateUser = await this.getUser();

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
      ['cba.branch_id', 'branchId'],
      ['br.branch_name', 'branchName'],
      ['cba.number', 'number'],
      ['cba.responsible_user_id', 'responsibleUserId'],
      ['us.first_name', 'picName'],
      ['us.username', 'nik'],
      ['cba.state', 'state'],
      ['cba.received_date', 'receivedDate'],
      ['cba.received_user_id', 'receivedUserId'],
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

  public async find(id: string): Promise<AllocationBalanceResponse> {
    const allocBalance = await this.cashbalRepo.findOne({
      where: {
        id,
        isDeleted: false,
      }
    })
    if (!allocBalance) {
      throw new BadRequestException('Alokasi Saldo Kas tidak Ditemukan!')
    }
    return new AllocationBalanceResponse(allocBalance as any)
  }

  public async approve(id: string) {
    const approveAllocation = await getManager().transaction(async (manager) => {
      const allocation = await manager.findOne(CashBalanceAllocation, {
        where: { id: id, isDeleted: false },
        relations: ['histories'],
      });
      if (!allocation) {
        throw new NotFoundException(`Alokasi ID ${id} tidak ditemukan!`);
      }

      const user = await AuthService.getUser({ relations: ['role'] });
      const userRole = user?.role?.name;

      // TODO: Implement State Machine for approval flow?
      let state: CashBalanceAllocationState;
      const currentState = allocation.state;
      if (userRole === MASTER_ROLES.PIC_HO) {
        // Approving with same state is not allowed
        if (
          currentState === CashBalanceAllocationState.APPROVED_BY_SS
        ) {
          throw new BadRequestException(
            `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}`,
          );
        }

        state = CashBalanceAllocationState.APPROVED_BY_SPV;
      } else if (
        userRole === MASTER_ROLES.SS_HO ||
        userRole === MASTER_ROLES.SPV_HO
      ) {
        // Approving with same state is not allowed
        if (currentState === CashBalanceAllocationState.APPROVED_BY_SPV) {
          throw new BadRequestException(
            `Tidak bisa approve Alokasi Saldo Kas dengan status ${currentState}`,
          );
        }

        state = CashBalanceAllocationState.APPROVED_BY_SPV;

      }

      if (!state) {
        throw new BadRequestException(
          `Gagal approve Alokasi Saldo Kas karena User Role tidak diketahui!`,
        );
      }

      allocation.state = state;
      allocation.allocationHistory = await this.buildHistory(allocation, { state });
      allocation.updateUser = user;
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
          relations: ['histories'],
        });
        if (!allocation) {
          throw new NotFoundException(`Alokasi Saldo Kas ID ${id} tidak ditemukan!`);
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
        allocation.updateUser = user;
        return await manager.save(allocation);
      });
      return rejectAllocation;
    } catch (error) {
      throw error;
    }
  }
}
