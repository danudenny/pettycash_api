import { EmployeeDTO } from './employee.dto';
import { Employee } from '../../../model/employee.entity';

export class EmployeeResponseMapper {
  public static toDTO(dto: Partial<EmployeeDTO>): EmployeeDTO {
    const it = new EmployeeDTO();
    it.id = dto.id;
    it.employeeId = dto.employeeId;
    it.nik = dto.nik;
    it.name = dto.name;
    it.employeeRoleId = dto.employeeRoleId;
    it.positionName = dto.positionName;
    it.branchId = dto.branchId;
    it.branchName = dto.branchName;
    it.dateOfEntry = dto.dateOfEntry;
    it.dateOfResign = dto.dateOfResign;
    return it;
  }

  public static fromOneEntity(ety: Partial<Employee>) {
    return this.toDTO({
      id: ety.id,
      employeeId: ety.employeeId,
      nik: ety.nik,
      name: ety.name,
      positionName: ety.employeeRole && ety.employeeRole.employeeRoleName,
      branchId: ety.branchId,
      branchName: ety.branch && ety.branch.branchName,
      dateOfEntry: ety.dateOfEntry,
      dateOfResign: ety.dateOfResign
    });
  }

  public static fromManyEntity(entities: Partial<Employee[]>) {
    return entities.map((e) => EmployeeResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<EmployeeDTO[]>) {
    return entities.map((e) => EmployeeResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<EmployeeDTO | EmployeeDTO[]>,
  ): EmployeeDTO | EmployeeDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
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
