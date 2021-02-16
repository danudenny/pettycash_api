import { EmployeeDTO } from './employee.dto';
import { Employee } from '../../../model/employee.entity';

export class EmployeeResponseMapper {
  public static fromDTO(dto: Partial<EmployeeDTO>): EmployeeDTO {
    const it = new EmployeeDTO();
    it.id = dto.id;
    it.employeeId = dto.employeeId;
    it.nik = dto.nik;
    it.name = dto.name;
    it.npwpNumber = dto.npwpNumber;
    it.idCardNumber = dto.idCardNumber;
    it.positionId = dto.positionId;
    it.positionName = dto.positionName;
    it.branchId = dto.branchId;
    return it;
  }

  public static fromOneEntity(ety: Partial<Employee>) {
    return this.fromDTO({
      id: ety.id,
      employeeId: ety.employeeId,
      nik: ety.nik,
      name: ety.name,
      npwpNumber: ety.npwpNumber,
      idCardNumber: ety.idCardNumber,
      positionId: ety.positionId,
      positionName: ety.positionName,
      branchId: ety.branchId,
    });
  }

  public static fromManyEntity(entities: Partial<Employee[]>) {
    return entities.map((e) => EmployeeResponseMapper.fromOneEntity(e));
  }

  public static fromEntity(
    entities: Partial<Employee | Employee[]>,
  ): EmployeeDTO | EmployeeDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
