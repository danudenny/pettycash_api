import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { RoleDTO } from './role.dto';

export class RoleResponse extends BaseResponse {
  constructor(data?: RoleDTO | RoleDTO[]) {
    super();
    if (data) {
      this.data = data;
    }
  }

  @ApiPropertyOptional({ type: () => [RoleDTO] })
  data?: RoleDTO | RoleDTO[] = null;
}
