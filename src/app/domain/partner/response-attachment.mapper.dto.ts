import { PartnerAttachmentDTO } from "./partner-attahcment.dto";

export class PartnerAttachmentResponseMapper {
  public static toDTO(
    dto: Partial<PartnerAttachmentDTO>,
  ): PartnerAttachmentDTO {
    const it = new PartnerAttachmentDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.fileMime = dto.fileMime;
    it.url = dto.url;
    it.typeId = dto.typeId;
    return it;
  }

  public static toManyDTO(entities: Partial<PartnerAttachmentDTO[]>) {
    return entities.map((e) => PartnerAttachmentResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<PartnerAttachmentDTO | PartnerAttachmentDTO[]>,
  ): PartnerAttachmentDTO | PartnerAttachmentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
