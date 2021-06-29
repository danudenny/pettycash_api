import { VoucherResponse } from './../../domain/voucher/response/voucher.response.dto';
import { VoucherCreateDTO } from './../../domain/voucher/dto/voucher-create.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, getManager } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { VoucherSunfish } from '../../../model/voucher-sunfish.entity';
import { Product } from '../../../model/product.entity';
import { VoucherItem } from '../../../model/voucher-item.entity';
import { AuthService } from './auth.service';
import { GenerateCode } from '../../../common/services/generate-code.service';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  public async list(
    query?: QueryVoucherDTO,
  ): Promise<VoucherWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(Voucher, 'vcr', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['number__icontains'] = 'vcr.number';
    qb.fieldResolverMap['startDate__gte'] = 'vcr.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'vcr.transactionDate';
    qb.fieldResolverMap['branchId'] = 'vcr.branchId';
    qb.fieldResolverMap['employeeId'] = 'vcr.employeeId';
    qb.fieldResolverMap['state'] = 'vcr.state';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['vcr.id', 'id'],
      ['vcr.transaction_date', 'transactionDate'],
      ['brc.branch_name', 'branchName'],
      ['emp.nik', 'employeeNik'],
      ['emp.name', 'employeeName'],
      ['emp.position_name', 'employeePosition'],
      ['vcr.number', 'number'],
      ['vcr.checkin_time', 'checkinTime'],
      ['vcr.checkout_time', 'checkoutTime'],
      ['vcr.total_amount', 'totalAmount'],
      ['vcr.is_realized', 'isRealized'],
      ['vcr.state', 'state'],
    );
    qb.leftJoin((e) => e.branch, 'brc');
    qb.leftJoin((e) => e.employee, 'emp');
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

    const vouchers = await qb.exec();
    return new VoucherWithPaginationResponse(vouchers, params);
  }

  public async getById(id: string): Promise<VoucherDetailResponse> {
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();
    const where = { id, isDeleted: false };
    if (!isSuperUser) {
      Object.assign(where, { branchId: In(userBranchIds) });
    }

    const voucher = await this.voucherRepo.findOne({
      where,
      relations: ['branch', 'employee', 'items', 'items.products'],
    });
    if (!voucher) {
      throw new NotFoundException(`Voucher ID ${id} tidak ditemukan!`);
    }
    return new VoucherDetailResponse(voucher);
  }

  public async create(payload: VoucherCreateDTO): Promise<VoucherResponse> {
    try {
      const createVoucher = await getManager().transaction(async (manager) => {
        if (payload && !payload.number) {
          payload.number = GenerateCode.voucherManual();
        }

        if (!(payload?.employeeId)) {
          throw new BadRequestException(
            `'Employee ID Harus Diisi!`,
          );
        }

        // Build Voucher Item
        const items: VoucherItem[] = [];
        for (const v of payload.items) {
          const item = new VoucherItem();
          item.productId = v.productId;
          item.amount = v.amount;
          item.createUserId = await VoucherService.getUserId();
          item.updateUserId = await VoucherService.getUserId();
          items.push(item);
        }

        // Build VOucher
        const voucher = new Voucher();
        voucher.branchId = payload.branchId;
        voucher.number = payload.number;
        voucher.checkinTime = payload.checkinTime;
        voucher.checkoutTime = payload.checkoutTime;
        voucher.transactionDate = payload.transactionDate;
        voucher.employeeId = payload?.employeeId;
        voucher.items = items;
        voucher.totalAmount = payload?.totalAmount;
        voucher.createUserId = await VoucherService.getUserId();
        voucher.updateUserId = await VoucherService.getUserId();

        const voucherResult = await manager.save(voucher);

        return voucherResult;
      });
      return new VoucherResponse(createVoucher)
    } catch (error) {
      throw error;
    }
  }
}
