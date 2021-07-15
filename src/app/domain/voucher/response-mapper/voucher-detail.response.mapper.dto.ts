import { VoucherDetailDTO } from '../dto/voucher-detail.dto';
import { VoucherItem } from '../../../../model/voucher-item.entity';
import { VoucherItemDTO } from '../dto/voucher-item.dto';
import { Voucher } from '../../../../model/voucher.entity';

export class VoucherDetailResponseMapper {
	public static toDTO(dto: VoucherDetailDTO): VoucherDetailDTO {
		return dto;
	}

	private static toVoucherItemDTO(data: VoucherItem[]): VoucherItemDTO[] {
		console.log(data)
		return data.map((v) => {
			const item = new VoucherItemDTO();
			item.productName = v.products && v.products.name;
			item.amount = v.amount;
			return item;
		});
	}

	public static fromOneEntity(ety: Partial<Voucher>) {
		return this.toDTO({
			id: ety.id,
			branchName: ety.branch && ety.branch.branchName,
			number: ety.number,
			transactionDate: ety.transactionDate,
			employeeNik: ety.employee && ety.employee.nik,
			employeeName: ety.employee && ety.employee.name,
			employeePosition: ety.employee && ety.employee.positionName,
			totalAmount: ety.totalAmount,
			paymentType: ety.paymentType,
			items: this.toVoucherItemDTO(ety.items),
		});
	}

	public static fromEntity(entities: Partial<Voucher>): VoucherDetailDTO {
		return this.fromOneEntity(entities);
	}
}
