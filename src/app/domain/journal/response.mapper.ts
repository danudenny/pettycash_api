import { Journal } from '../../../model/journal.entity';
import { JournalItemDTO } from './journal-item.dto';
import { JournalDTO } from './journal.dto';

export class JournalResponseMapper {
  public static toDTO(ety: Journal): JournalDTO {
    const j = new JournalDTO();
    j.id = ety.id;
    j.transactionDate = ety.transactionDate;
    j.periodMonth = ety?.period?.month;
    j.periodYear = ety?.period?.year;
    j.number = ety.number;
    j.reference = ety.reference;
    j.partnerName = ety.partnerName;
    j.partnerCode = ety.partnerCode;
    j.totalAmount = +ety.totalAmount;
    j.state = ety.state;
    j.items = this.toItemDTO(ety);
    return j;
  }

  private static toItemDTO(journal: Journal): JournalItemDTO[] {
    const dtoItems = journal?.items.map((v) => {
      const i = new JournalItemDTO();
      i.id = v.id;
      i.transactionDate = v.transactionDate;
      i.periodMonth = v?.period?.month;
      i.periodYear = v?.period?.year;
      i.number = journal?.number;
      i.reference = v.reference;
      i.partnerName = v.partnerName;
      i.partnerCode = v.partnerCode;
      i.coaId = v.coaId;
      i.coaName = v?.coa?.name;
      i.coaCode = v?.coa?.code;
      i.debit = +v.debit;
      i.credit = +v.credit;
      return i;
    });

    return dtoItems;
  }

  private static toManyDTO(entities: Journal[]): JournalDTO[] {
    return entities.map((e) => JournalResponseMapper.toDTO(e));
  }

  public static fromEntity(entities: Journal[]): JournalDTO[] {
    return this.toManyDTO(entities);
  }
}
