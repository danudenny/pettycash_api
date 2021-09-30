import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { UserBranchResponse } from '../../domain/user-branch/response.dto';
import { UserBranchDTO } from '../../domain/user-branch/user-branch.dto';

@Injectable()
export class UserBranchService {
  async get(xUsername: string): Promise<UserBranchResponse> {
    let userBranch = (
      await getManager().query(
        `SELECT 
          users.id AS userId, 
          first_name AS firstName, 
          last_name AS lastName,
          (SELECT ARRAY(SELECT branch_id FROM user_branch WHERE user_id = id)) AS branchIds
        FROM users 
        WHERE username = '${xUsername}'`,
      )
    )[0];
    console.log(userBranch);
    return new UserBranchResponse(userBranch);
  }
}
