import { LoanAttachmentDTO } from './loan-attachment.dto';

export class LoanAttachmentResponseMapper {
  public static toDTO(dto: Partial<LoanAttachmentDTO>): LoanAttachmentDTO {
    const it = new LoanAttachmentDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.fileMime = dto.fileMime;
    it.url = dto.url;
    return it;
  }

  public static toManyDTO(datas: Partial<LoanAttachmentDTO[]>) {
    return datas.map((data) => LoanAttachmentResponseMapper.toDTO(data));
  }

  public static fromDTO(
    data: Partial<LoanAttachmentDTO | LoanAttachmentDTO[]>,
  ): LoanAttachmentDTO | LoanAttachmentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
