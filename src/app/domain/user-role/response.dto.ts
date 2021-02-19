import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { UserRoleResponseMapper } from './response.mapper';
import { UserRoleDTO } from './user-role.dto';

export class UserRoleResponse extends BaseResponse {
  constructor(data?: Partial<UserRoleDTO | UserRoleDTO[]>) {
    super();
    if (data) {
      this.data = UserRoleResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [UserRoleDTO] })
  data?: UserRoleDTO | UserRoleDTO[] = null;
}
