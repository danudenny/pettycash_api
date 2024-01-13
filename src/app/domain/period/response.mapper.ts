import { Period } from '../../../model/period.entity';
import { PeriodDTO } from './period.dto';

export class PeriodResponseMapper {
  public static toDTO(dto: Partial<PeriodDTO>): PeriodDTO {
    const it = new PeriodDTO();
    it.id = dto.id;
    it.name = dto.name;
    it.month = dto.month;
    it.year = dto.year;
    it.state = dto.state;
    it.closeDate = dto.closeDate;
    it.closeUserId = dto.closeUserId;
    it.closeUserFirstName = dto.closeUserFirstName;
    it.closeUserLastName = dto.closeUserLastName;
    it.closeUserNIK = dto.closeUserNIK;
    return it;
  }

  public static fromOneEntity(ety: Partial<Period>) {
    return this.toDTO({
      id: ety.id,
      name: ety.name,
      month: ety.month,
      year: ety.year,
      state: ety.state,
      closeDate: ety.closeDate,
      closeUserId: ety.closeUserId,
      closeUserFirstName: ety.closeUser && ety.closeUser.firstName,
      closeUserLastName: ety.closeUser && ety.closeUser.lastName,
      closeUserNIK: ety.closeUser && ety.closeUser.username,
    });
  }

  public static fromManyEntity(entities: Partial<Period[]>) {
    return entities.map((e) => PeriodResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<PeriodDTO[]>) {
    return entities.map((e) => PeriodResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<PeriodDTO | PeriodDTO[]>,
  ): PeriodDTO | PeriodDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Period | Period[]>,
  ): PeriodDTO | PeriodDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
