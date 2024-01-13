import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
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

export class UserRoleWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<UserRoleDTO | UserRoleDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = UserRoleResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [UserRoleDTO] })
  data?: UserRoleDTO | UserRoleDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}