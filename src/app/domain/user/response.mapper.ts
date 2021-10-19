import { UserDTO } from './user.dto';

export class UserResponseMapper {
  public static toDTO(dto: Partial<UserDTO>) {
    const it = new UserDTO();
    it.id = dto.id;
    it.nik = dto.username;
    it.username = dto.username;
    it.firstName = dto.firstName;
    it.lastName = dto.lastName || '';
    return it;
  }

  public static toManyDTO(entities: Partial<UserDTO[]>) {
    return entities.map((e) => UserResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<UserDTO | UserDTO[]>,
  ): UserDTO | UserDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
