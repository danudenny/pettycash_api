import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationResponse } from '../common/base-pagination-response.dto';
import { BaseResponse } from '../common/base-response.dto';
import { PaginationBuilder } from '../common/pagination-builder';
import { UserResponseMapper } from './response.mapper';
import { UserDTO } from './user.dto';

export class UserResponse extends BaseResponse {
  constructor(data?: Partial<UserDTO | UserDTO[]>) {
    super();
    if (data) {
      this.data = UserResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [UserDTO] })
  data?: UserDTO | UserDTO[] = null;
}

export class UserWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<UserDTO | UserDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = UserResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [UserDTO] })
  data?: UserDTO | UserDTO[] = null;

  @ApiPropertyOptional()
  meta?: BasePaginationResponse;
}
