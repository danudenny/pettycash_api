import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { UserBranchResponseMapper } from './response.mapper';
import { UserBranchDTO } from './user-branch.dto';

export class UserBranchResponse extends BaseResponse {
  constructor(data?: any) {
    super();
    if (data) {
      this.data = UserBranchResponseMapper.toDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => UserBranchDTO })
  data?: UserBranchDTO = null;
}
