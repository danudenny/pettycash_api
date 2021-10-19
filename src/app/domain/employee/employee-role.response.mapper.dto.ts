import { EmployeeRole } from '../../../model/employee-role.entity';
import { EmployeeRoleDTO } from './employee-role.dto';

export class EmployeeRoleResponseMapper {
  public static toDTO(dto: Partial<EmployeeRoleDTO>): EmployeeRoleDTO {
    const it = new EmployeeRoleDTO();
    it.id = dto.id;
    it.employeeRoleId = dto.employeeRoleId;
    it.employeeRoleCode = dto.employeeRoleCode;
    it.employeeRoleName = dto.employeeRoleName;
    it.employeeLevel = dto.employeeLevel || '-';
    it.employeePosition = dto.employeePosition || '-';
    return it;
  }

  public static fromOneEntity(ety: Partial<EmployeeRole>) {
    return this.toDTO({
      id: ety.id,
      employeeRoleId: ety.employeeRoleId,
      employeeRoleCode: ety.employeeRoleCode,
      employeeRoleName: ety.employeeRoleName,
      employeeLevel: ety.employeeLevel,
      employeePosition: ety.employeePosition,
    });
  }

  public static fromManyEntity(entities: Partial<EmployeeRole[]>) {
    return entities.map((e) => EmployeeRoleResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<EmployeeRoleDTO[]>) {
    return entities.map((e) => EmployeeRoleResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<EmployeeRoleDTO | EmployeeRoleDTO[]>,
  ): EmployeeRoleDTO | EmployeeRoleDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<EmployeeRole | EmployeeRole[]>,
  ): EmployeeRoleDTO | EmployeeRoleDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
