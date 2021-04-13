import { BankBranchDTO } from './bank-branch.dto';

export class BankBranchResponseMapper {
  public static toDTO(dto: Partial<BankBranchDTO>): BankBranchDTO {
    const it = new BankBranchDTO();
    it.id = dto.id;
    it.bankName = dto.bankName;
    it.accountNumber = dto.accountNumber;
    it.accountHolderName = dto.accountHolderName;
    return it;
  }

  public static toManyDTO(dtos: Partial<BankBranchDTO[]>) {
    return dtos.map((dto) => BankBranchResponseMapper.toDTO(dto));
  }

  public static fromQueryBuilder(
    data: Partial<BankBranchDTO | BankBranchDTO[]>,
  ): BankBranchDTO | BankBranchDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
