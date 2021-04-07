import { BadRequestException, HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { AuthService } from './auth.service';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherResponse, VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO, QueryVoucherSunfishDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { VoucherItemDTO } from '../../domain/voucher/dto/voucher-item.dto';
import dayjs from 'dayjs';

@Injectable()
export class VoucherService {
	constructor(
		@InjectRepository(Voucher)
		private readonly voucherRepo: Repository<Voucher>,
		private httpService: HttpService,
	) {
	}

	private async getUser(includeBranch: boolean = false) {
		if (includeBranch) {
			return await AuthService.getUser({ relations: ['branches'] });
		} else {
			return await AuthService.getUser();
		}
	}

	public async list(
		query?: QueryVoucherDTO,
	): Promise<VoucherWithPaginationResponse> {
		const params = { order: '^created_at', limit: 10, ...query };
		const qb = new QueryBuilder(Voucher, 'vcr', params);

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

		const vouchers = await qb.exec();
		return new VoucherWithPaginationResponse(vouchers, params);
	}

	public async getById(id: string): Promise<VoucherDetailResponse> {
		const voucher = await this.voucherRepo.findOne({
			where: { id, isDeleted: false },
			relations: [
				'branch',
				'employee',
				'items',
			],
		});
		if (!voucher) {
			throw new NotFoundException(`Voucher ID ${id} tidak ditemukan!`);
		}
		return new VoucherDetailResponse(voucher);
	}

	public async getSunfish(
		query?: QueryVoucherSunfishDTO
	): Promise<AxiosResponse<any>> {
		const headersRequest = {
			'X-SFAPI-Account': process.env.X_SFAPI_ACCOUNT,
			'X-SFAPI-AppName': process.env.X_SFAPI_APPNAME,
			'X-SFAPI-RSAKey': process.env.X_SFAPI_RSAKEY,
			'Content-Type': 'application/json',
			'Accept-Encoding': '*'
		};

		try {
				const response = await axios.get(process.env.SUNFISH_URL, {
					headers: headersRequest,
					params: {
						'attendance_date': dayjs(new Date).format('YYYY-MM-DD'),
						'nik': query.nik
					}
				})
				console.log(response.data['RESULT'].length)
				return response.data
			} catch (error) {
				return {
					status: error.response,
					...error.response,
				};
			}
		}


}
