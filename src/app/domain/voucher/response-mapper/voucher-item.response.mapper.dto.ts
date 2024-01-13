import { VoucherItemDTO } from '../dto/voucher-item.dto';
import { VoucherItem } from '../../../../model/voucher-item.entity';

export class VoucherItemResponseMapper {
	public static toDTO(dto: Partial<VoucherItemDTO>): VoucherItemDTO {
		const it = new VoucherItemDTO();
		it.productName = dto.productName;
		it.amount = dto.amount;
		return it;
	}

	public static fromOneEntity(ety: Partial<VoucherItem>) {
		return this.toDTO({
			productName: ety.products && ety.products.name,
			amount: ety.amount,
		});
	}

	public static fromManyEntity(entities: Partial<VoucherItem[]>) {
		return entities.map((e) => VoucherItemResponseMapper.fromOneEntity(e));
	}

	public static toManyDTO(entities: Partial<VoucherItemDTO[]>) {
		return entities.map((e) => VoucherItemResponseMapper.toDTO(e));
	}

	public static fromDTO(
		data: Partial<VoucherItemDTO | VoucherItemDTO[]>,
	): VoucherItemDTO | VoucherItemDTO[] {
		if (!Array.isArray(data)) {
			return this.toDTO(data);
		} else {
			return this.toManyDTO(data);
		}
	}

	public static fromEntity(
		entities: Partial<VoucherItem | VoucherItem[]>,
	): VoucherItemDTO | VoucherItemDTO[] {
		if (!Array.isArray(entities)) {
			return this.fromOneEntity(entities);
		} else {
			return this.fromManyEntity(entities);
		}
	}
}
