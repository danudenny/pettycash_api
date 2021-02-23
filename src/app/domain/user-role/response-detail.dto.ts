import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../../model/user.entity';
import { BaseResponse } from '../common/base-response.dto';
import { UserRoleResponseMapper } from './response.mapper';
import { UserRoleDetailDTO } from './user-role-detail.dto';

export class UserRoleDetailResponse extends BaseResponse {
  constructor(data?: User) {
    super();
    if (data) {
      this.data = UserRoleResponseMapper.toDetailDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => UserRoleDetailDTO })
  data?: UserRoleDetailDTO;
}
