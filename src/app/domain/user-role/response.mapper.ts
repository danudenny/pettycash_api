import { User } from '../../../model/user.entity';
import { UserRoleDetailDTO } from './user-role-detail.dto';
import { UserRoleDTO } from './user-role.dto';

export class UserRoleResponseMapper {
  public static toDTO(dto: Partial<UserRoleDTO>) {
    const it = new UserRoleDTO();
    it.id = dto.id;
    it.nik = dto.username;
    it.username = dto.username;
    it.fullName = dto.fullName;
    it.roleId = dto.roleId;
    it.roleName = dto.roleName;
    return it;
  }

  public static toManyDTO(entities: Partial<UserRoleDTO[]>) {
    return entities.map((e) => UserRoleResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<UserRoleDTO | UserRoleDTO[]>,
  ): UserRoleDTO | UserRoleDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static toDetailDTO(dto: User) {
    const it = new UserRoleDetailDTO();
    it.id = dto.id;
    it.nik = dto.username;
    it.username = dto.username;
    it.fullName = `${dto.firstName} ${dto.lastName || ''}`;
    it.roleId = dto.roleId;
    it.roleName = dto.role && dto.role.name;
    it.branches =
      dto.branches &&
      dto.branches.map((v) => {
        return { id: v.id, name: v.branchName };
      });
    return it;
  }
}
