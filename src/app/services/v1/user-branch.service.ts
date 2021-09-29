import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { UserBranchResponse } from '../../domain/user-branch/response.dto';

@Injectable()
export class UserBranchService {
  async get(xUsername: string): Promise<UserBranchResponse> {
    let userBranch = await getManager().query(
      `SELECT 
        users.id AS userId, 
        first_name AS fistName, 
        last_name AS lastName,
        (SELECT ARRAY(SELECT branch_id FROM user_branch WHERE user_id = id)) AS branch_ids
      FROM users 
      WHERE username = '${xUsername}'`,
    );
    let response: UserBranchResponse = {
      status: 'success',
      data: userBranch,
    };
    return response;
  }
}
