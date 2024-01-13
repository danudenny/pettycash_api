import { AttachmentTypeDTO } from "./att-type.dto";

export class AttachmentTypeResponseMapper {
  public static toDTO(dto: Partial<AttachmentTypeDTO>): AttachmentTypeDTO {
    const it = new AttachmentTypeDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    it.type = dto.type;
    return it;
  }

  public static toManyDTO(dtos: Partial<AttachmentTypeDTO[]>) {
    return dtos.map((d) => AttachmentTypeResponseMapper.toDTO(d));
  }

  public static fromDTO(
    data: Partial<AttachmentTypeDTO | AttachmentTypeDTO[]>,
  ): AttachmentTypeDTO | AttachmentTypeDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
