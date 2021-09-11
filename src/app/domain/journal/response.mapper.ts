import { Journal } from '../../../model/journal.entity';
import { roundToTwo } from '../../../shared/utils';
import { JournalItemDTO } from './journal-item.dto';
import { JournalDTO } from './journal.dto';

export class JournalResponseMapper {
  public static toDTO(ety: Journal): JournalDTO {
    const j = new JournalDTO();
    j.id = ety.id;
    j.reverseJournalId = ety.reverseJournalId;
    j.branchId = ety.branch?.id;
    j.branchName = ety.branch?.branchName;
    j.transactionDate = ety.transactionDate;
    j.periodMonth = ety?.period?.month;
    j.periodYear = ety?.period?.year;
    j.number = ety.number;
    j.reference = ety.reference;
    j.downPaymentNumber = ety.downPaymentNumber;
    j.syncFailReason = ety.syncFailReason;
    j.partnerName = ety.partnerName;
    j.partnerCode = ety.partnerCode;
    j.totalAmount = roundToTwo(ety.totalAmount);
    j.state = ety.state;
    j.items = this.toItemDTO(ety);
    return j;
  }

  private static toItemDTO(journal: Journal): JournalItemDTO[] {
    const dtoItems = journal?.items?.map((v) => {
      const i = new JournalItemDTO();
      i.id = v.id;
      i.transactionDate = v.transactionDate;
      i.periodMonth = journal?.period?.month;
      i.periodYear = journal?.period?.year;
      i.number = journal?.number;
      i.reference = v.reference;
      i.description = v.description;
      i.partnerName = v.partnerName;
      i.partnerCode = v.partnerCode;
      i.coaId = v.coaId;
      i.coaName = v?.coa?.name;
      i.coaCode = v?.coa?.code;
      i.debit = roundToTwo(v.debit);
      i.credit = roundToTwo(v.credit);
      i.isLedger = v.isLedger;
      return i;
    });

    return dtoItems || [];
  }

  private static toManyDTO(entities: Journal[]): JournalDTO[] {
    return entities.map((e) => JournalResponseMapper.toDTO(e));
  }

  public static fromEntity(entities: Journal[]): JournalDTO[] {
    return this.toManyDTO(entities);
  }
}
