import { ReportParkingJournalDTO } from './report-parking-journal.dto';

export class ReportParkingJournalResponseMapper {
  public static toDTO(data: ReportParkingJournalDTO): ReportParkingJournalDTO {
    // make string of number to number.
    data.debit = +data?.debit;
    data.credit = +data?.credit;
    return data;
  }

  public static toManyDTO(
    datas: ReportParkingJournalDTO[],
  ): ReportParkingJournalDTO[] {
    return datas.map((data) => ReportParkingJournalResponseMapper.toDTO(data));
  }

  public static fromDTO(
    data: ReportParkingJournalDTO | ReportParkingJournalDTO[],
  ): ReportParkingJournalDTO | ReportParkingJournalDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
