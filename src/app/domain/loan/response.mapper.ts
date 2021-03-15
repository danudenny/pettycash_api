import { LoanDTO } from './loan.dto';

export class LoanResponseMapper {
  public static fromDTO(
    data: Partial<LoanDTO | LoanDTO[]>,
  ): LoanDTO | LoanDTO[] {
    // TODO: Implement mapper
    return data as LoanDTO[];
  }
}
