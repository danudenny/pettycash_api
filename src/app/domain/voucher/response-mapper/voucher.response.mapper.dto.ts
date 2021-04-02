import { VoucherDTO } from '../dto/voucher.dto';
import { Voucher } from '../../../../model/voucher.entity';

export class VoucherResponseMapper {
	public static toDTO(dto: Partial<VoucherDTO>): VoucherDTO {
		const it = new VoucherDTO();
		it.id = dto.id;
		it.branchId = dto.branchId;
		it.branchName = dto.branchName;
		it.number = dto.number;
		it.transactionDate = dto.transactionDate;
		it.employeeId = dto.employeeId;
		it.employeeNik = dto.employeeNik;
		it.employeeName = dto.employeeName;
		it.employeePosition = dto.employeePosition;
		it.checkinTime = dto.checkinTime;
		it.checkoutTime = dto.checkoutTime;
		it.totalAmount = dto.totalAmount;
		it.isRealized = dto.isRealized;
		it.state = dto.state;
		return it;
	}

	public static fromOneEntity(ety: Partial<Voucher>) {
		return this.toDTO({
			id: ety.id,
			branchId: ety.branchId,
			branchName: ety.branch && ety.branch.branchName,
			number: ety.number,
			transactionDate: ety.transactionDate,
			employeeId: ety.employeeId,
			employeeNik: ety.employee && ety.employee.nik,
			employeeName: ety.employee && ety.employee.name,
			employeePosition: ety.employee && ety.employee.positionName,
			checkinTime : ety.checkinTime,
			checkoutTime : ety.checkoutTime,
			totalAmount: ety.totalAmount,
			isRealized: ety.isRealized,
			state: ety.state,
		});
	}

	public static fromManyEntity(entities: Partial<Voucher[]>) {
		return entities.map((e) => VoucherResponseMapper.fromOneEntity(e));
	}

	public static toManyDTO(entities: Partial<VoucherDTO[]>) {
		return entities.map((e) => VoucherResponseMapper.toDTO(e));
	}

	public static fromDTO(
		data: Partial<VoucherDTO | VoucherDTO[]>,
	): VoucherDTO | VoucherDTO[] {
		if (!Array.isArray(data)) {
			return this.toDTO(data);
		} else {
			return this.toManyDTO(data);
		}
	}

	public static fromEntity(
		entities: Partial<Voucher | Voucher[]>,
	): VoucherDTO | VoucherDTO[] {
		if (!Array.isArray(entities)) {
			return this.fromOneEntity(entities);
		} else {
			return this.fromManyEntity(entities);
		}
	}
}
