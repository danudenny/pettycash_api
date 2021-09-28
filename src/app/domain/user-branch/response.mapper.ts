import { UserBranchDTO } from './user-branch.dto';

export class UserBranchResponseMapper {
  public static toDTO(dto: UserBranchDTO) {
    const it = new UserBranchDTO();
    it.id = dto.id;
    it.username = dto.username;
    it.firstName = dto.firstName;
    it.lastName = dto.lastName;
    it.branch_ids = dto.branch_ids;
    return it;
  }

  public static fromDTO(data: UserBranchDTO): UserBranchDTO {
    return this.toDTO(data);
  }
}
