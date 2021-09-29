import { UserBranchDTO } from './user-branch.dto';

export class UserBranchResponseMapper {
  public static toDTO(obj: {
    userid: string;
    firstname: string;
    lastname: string;
    branchids: string[];
  }) {
    const it = new UserBranchDTO();
    it.userId = obj.userid;
    it.firstName = obj.firstname;
    it.lastName = obj.lastname;
    it.branchIds = obj.branchids;
    return it;
  }
}
