import { Period } from '../../../model/period.entity';
import { PeriodYearDTO } from './period-year.dto';

export class PeriodYearResponseMapper {
  public static fromDTO(dto: Partial<PeriodYearDTO>): PeriodYearDTO {
    const it = new PeriodYearDTO();
    it.year = dto.year;
    return it;
  }

  public static fromOneEntity(ety: Partial<Period>) {
    return this.fromDTO({
      year: ety.year,
    });
  }

  public static fromManyEntity(entities: Partial<Period[]>) {
    return entities.map((e) => PeriodYearResponseMapper.fromOneEntity(e));
  }

  public static fromEntity(
    entities: Partial<Period | Period[]>,
  ): PeriodYearDTO | PeriodYearDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
