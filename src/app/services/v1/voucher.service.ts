import { BadRequestException, HttpException, HttpService, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { AuthService } from './auth.service';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import { QueryVoucherDTO, QueryVoucherSunfishDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { CreateVoucherItemDTO } from '../../domain/voucher/dto/voucher-item.dto';
import dayjs from 'dayjs';
import { VoucherSunfish } from '../../../model/voucher-sunfish.entity';
import { CreateVoucherDTO } from '../../domain/voucher/dto/voucher-create.dto';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { VoucherState } from '../../../model/utils/enum';
import { Product } from '../../../model/product.entity';
import { VoucherItem } from '../../../model/voucher-item.entity';

@Injectable()
export class VoucherService {
	constructor(
		@InjectRepository(Voucher)
		private readonly voucherRepo: Repository<Voucher>,
		@InjectRepository(VoucherSunfish)
		private readonly voucherSunfishRepo: Repository<VoucherSunfish>,
		@InjectRepository(VoucherItem)
		private readonly voucherItemRepo: Repository<VoucherItem>,
		@InjectRepository(Product)
		private readonly productRepo: Repository<Product>,
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

				return response.data
			} catch (error) {
				return {
					status: error.response,
					...error.response,
				};
			}
		}

		public async getTempTable() {
			return await this.voucherSunfishRepo.find({
				where: {
					isDeleted: false,
					isProcessed: false
				},
				relations: ['branch']
			});
		}

		public async tempToVoucher(data: CreateVoucherDTO, itemData?: CreateVoucherItemDTO) : Promise<any> {
			const arrTemp: Voucher[] = [];
			const itemVoucher: VoucherItem[] = [];
			const getTempData = await this.getTempTable()
			const getUserData = await this.getUser()

			if(getTempData.length === 0) {
				return {
					status: HttpStatus.BAD_REQUEST,
					message: 'Semua Data Sudah Diproses'
				}
			}

			for (let i = 0; i < getTempData.length; i++) {
				const dataTemp = getTempData[i];
				const vcrItemDto = await this.voucherItemRepo.create(itemData);
				const getProduct = await this.productRepo.find({
					where: {
						isDeleted: false,
						name: dataTemp.data[i]['allowance_name']
					}
				});

				const prodId = getProduct.map(({ id }) => id);

				let totalAmount = 0;
				for (let j = 0; j < Object.keys(dataTemp.data).length; j++) {
					const data = dataTemp.data[j]['allowance_amount'];
					vcrItemDto.productId = prodId.toString();
					vcrItemDto.amount = dataTemp.data[i]['allowance_amount'];
					vcrItemDto.createUserId = getUserData.id;
					vcrItemDto.updateUserId = getUserData.id;
					itemVoucher.push(vcrItemDto);
					totalAmount += data
				}

				const voucher = new Voucher();
				voucher.createUserId = getUserData.id;
				voucher.updateUserId = getUserData.id;
				voucher.number = GenerateCode.voucher();
				voucher.state = VoucherState.DRAFT;
				voucher.checkinTime = dataTemp.startTime;
				voucher.checkoutTime = dataTemp.end_time;
				voucher.transactionDate = new Date();
				voucher.branchId = dataTemp.branchId;
				voucher.employeeId = data.employeeId;
				voucher.employeePosition = data.employeePosition;
				voucher.totalAmount = totalAmount;
				voucher.items = itemVoucher;

				arrTemp.push(voucher);

				await this.voucherSunfishRepo.update(dataTemp.id, { isProcessed : true });
			}

			try {
				const result = await this.voucherRepo.save(arrTemp);

				return {
					status: HttpStatus.OK,
					message: 'Sukses Generate Voucher',
					data: result
				}
			} catch (err) {
				throw new Error(err);
			}
		}


}
