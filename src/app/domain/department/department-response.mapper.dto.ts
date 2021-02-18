import { DepartmentDTO } from './department.dto';
import { Department } from '../../../model/department.entity';

export class DepartmentResponseMapper {
  public static fromDTO(dto: Partial<DepartmentDTO>): DepartmentDTO {
    const it = new DepartmentDTO();
    it.id = dto.id;
    it.departmentId = dto.departmentId;
    it.departmentParentId = dto.departmentParentId;
    it.code = dto.code;
    it.name = dto.name;
    return it;
  }

  public static fromOneEntity(ety: Partial<Department>) {
    return this.fromDTO({
      id: ety.id,
      departmentId: ety.departmentId,
      departmentParentId: ety.departmentParentId,
      code: ety.code,
      name: ety.name
    });
  }

  public static fromManyEntity(entities: Partial<Department[]>) {
    return entities.map((e) => DepartmentResponseMapper.fromOneEntity(e));
  }

  public static fromEntity(
    entities: Partial<Department | Department[]>,
  ): DepartmentDTO | DepartmentDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}
