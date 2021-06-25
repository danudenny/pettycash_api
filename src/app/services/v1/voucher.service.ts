import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import {
  QueryVoucherDTO
} from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { VoucherSunfish } from '../../../model/voucher-sunfish.entity';
import { Product } from '../../../model/product.entity';
import { VoucherItem } from '../../../model/voucher-item.entity';
import { AuthService } from './auth.service';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
  ) {}

  public async list(
    query?: QueryVoucherDTO,
  ): Promise<VoucherWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(Voucher, 'vcr', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

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
}
