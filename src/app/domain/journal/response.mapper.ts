import { roundToTwo } from '../../../shared/utils';
import { JournalDTO } from './journal.dto';

export class JournalResponseMapper {
  public static toDTO(dto: JournalDTO): JournalDTO {
    dto.debit = roundToTwo(+dto.debit);
    dto.credit = roundToTwo(+dto.credit);
    return dto;
  }

  private static toManyDTO(items: JournalDTO[]): JournalDTO[] {
    return items.map((i) => JournalResponseMapper.toDTO(i));
  }

  public static fromQueryBuilder(journalItems: JournalDTO[]): JournalDTO[] {
    return this.toManyDTO(journalItems);
  }
}
