import { AccountDailyClosingAttachmentDTO } from "../dto/account-daily-closing-attachment.dto";

export class AccountDailyClosingAttachmentMapper {

  public static fromDTO(
    dtoList: Partial<AccountDailyClosingAttachmentDTO[]>
  ): AccountDailyClosingAttachmentDTO[] {
    return dtoList.map((dto) => {
      const item = new AccountDailyClosingAttachmentDTO();
      item.id = dto.id;
      item.name = dto.name;
      item.fileName = dto.fileName;
      item.fileMime = dto.fileMime;
      item.url = dto.url;

      return item;
    });
  }
}