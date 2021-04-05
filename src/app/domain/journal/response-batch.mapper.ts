import { BatchJournalDTO } from './batch-journal.dto';

export class JournalBatchResponseMapper {
  public static fromObject(data: any): BatchJournalDTO {
    const batchJournal = new BatchJournalDTO();
    batchJournal.success = data?.success;
    batchJournal.fail = data?.fail;
    return batchJournal;
  }
}
