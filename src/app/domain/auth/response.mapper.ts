import { User } from '../../../model/user.entity';
import { AuthorizationDTO } from './authorization.dto';

export class AuthorizationResponseMapper {
  private static toDTO(ety: User): AuthorizationDTO {
    const it = new AuthorizationDTO();
    it.id = ety.id;
    it.username = ety.username;
    it.roleId = ety.roleId;
    it.roleName = ety.role && ety.role.name;
    it.permissions =
      ety.role &&
      ety.role.permissions &&
      ety.role.permissions.map((v) => v.name);
    return it;
  }

  public static fromEntity(ety: User) {
    return this.toDTO(ety);
  }
}
