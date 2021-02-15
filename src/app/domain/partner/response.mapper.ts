import { PartnerDTO } from './partner.dto';

export class PartnerResponseMapper {
  public static toDTO(dto: Partial<PartnerDTO>): PartnerDTO {
    const it = new PartnerDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    it.address = dto.address;
    it.type = dto.type;
    it.npwpNumber = dto.npwpNumber;
    it.idCardNumber = dto.idCardNumber;
    it.state = dto.state;
    it.createdAt = dto.createdAt;
    return it;
  }

  public static toManyDTO(dtos: Partial<PartnerDTO[]>) {
    return dtos.map((dto) => PartnerResponseMapper.toDTO(dto));
  }

  public static fromDTO(
    data: Partial<PartnerDTO | PartnerDTO[]>,
  ): PartnerDTO | PartnerDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
