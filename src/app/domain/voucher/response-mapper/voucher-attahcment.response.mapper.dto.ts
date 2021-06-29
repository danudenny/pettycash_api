import { VoucherAttachmentDTO } from "../dto/voucher-attachment.dto";

export class VoucherAttachmentResponseMapper {
  public static toDTO(
    dto: Partial<VoucherAttachmentDTO>,
  ): VoucherAttachmentDTO {
    const it = new VoucherAttachmentDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.fileMime = dto.fileMime;
    it.url = dto.url;
    it.typeId = dto?.typeId || null;
    it.typeName = dto?.typeName || null;
    it.isChecked = dto.isChecked;
    return it;
  }

  public static toManyDTO(entities: Partial<VoucherAttachmentDTO[]>) {
    return entities.map((e) => VoucherAttachmentResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<VoucherAttachmentDTO | VoucherAttachmentDTO[]>,
  ): VoucherAttachmentDTO | VoucherAttachmentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
