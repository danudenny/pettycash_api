import { JournalDTO } from './journal.dto';

export class JournalResponseMapper {
  public static fromDTO(
    data: Partial<JournalDTO | JournalDTO[]>,
  ): JournalDTO | JournalDTO[] {
    // TODO: Implement mapper
    return data as JournalDTO[];
  }
}
