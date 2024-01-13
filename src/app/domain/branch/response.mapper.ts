import { BranchDTO } from './branch.dto';

export class BranchResponseMapper {
  public static toDTO(dto: Partial<BranchDTO>): BranchDTO {
    const it = new BranchDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    it.coaId = dto.coaId;
    return it;
  }

  public static toManyDTO(dtos: Partial<BranchDTO[]>) {
    return dtos.map((dto) => BranchResponseMapper.toDTO(dto));
  }

  public static fromDTO(
    data: Partial<BranchDTO | BranchDTO[]>,
  ): BranchDTO | BranchDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
