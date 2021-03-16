import { ExpenseAttachmentDTO } from './expense-attachment.dto';

export class ExpenseAttachmentResponseMapper {
  public static toDTO(
    dto: Partial<ExpenseAttachmentDTO>,
  ): ExpenseAttachmentDTO {
    const it = new ExpenseAttachmentDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.fileName = dto.fileName;
    it.fileMime = dto.fileMime;
    it.url = dto.url;
    return it;
  }

  public static toManyDTO(entities: Partial<ExpenseAttachmentDTO[]>) {
    return entities.map((e) => ExpenseAttachmentResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<ExpenseAttachmentDTO | ExpenseAttachmentDTO[]>,
  ): ExpenseAttachmentDTO | ExpenseAttachmentDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
