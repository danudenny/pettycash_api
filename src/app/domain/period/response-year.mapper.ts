import { Period } from '../../../model/period.entity';
import { PeriodYearDTO } from './period-year.dto';

export class PeriodYearResponseMapper {
  public static fromDTO(dto: Partial<PeriodYearDTO>): PeriodYearDTO {
    const it = new PeriodYearDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.month = dto.month;
    it.year = dto.year;
    it.state = dto.state;
    return it;
  }

  public static fromOneEntity(ety: Partial<Period>) {
    return this.fromDTO({
      id: ety.id,
      name: ety.name,
      month: ety.month,
      year: ety.year,
      state: ety.state,
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
