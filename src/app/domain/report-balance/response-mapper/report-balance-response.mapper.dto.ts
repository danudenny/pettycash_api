import { ReportBalanceDTO } from '../dto/report-balance.dto';

export class ReportBalanceResponseMapper {
	public static toDTO(dto: Partial<ReportBalanceDTO>): ReportBalanceDTO {
		const it = new ReportBalanceDTO();
		it.branchId = dto?.branchId ?? null;
		it.branchName = dto?.branchName ?? null;
		it.bankAmount = +dto?.bankAmount ?? null;
		it.cashAmount = +dto?.cashAmount ?? null;
		it.totalAmount = +dto?.totalAmount ?? null;
		it.minimumAmount = +dto?.minimumAmount ?? null;
		it.retrieveAt = dto?.retrieveAt ?? null;
		return it;
	}

	public static toManyDTO(entities: Partial<ReportBalanceDTO[]>) {
		return entities.map((e) => ReportBalanceResponseMapper.toDTO(e));
	}

	public static fromDTO(
		data: Partial<ReportBalanceDTO | ReportBalanceDTO[]>,
	): ReportBalanceDTO | ReportBalanceDTO[] {
		if (!Array.isArray(data)) {
			return this.toDTO(data);
		} else {
			return this.toManyDTO(data);
		}
	}

}
