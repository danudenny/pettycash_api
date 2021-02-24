import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../../model/user.entity';
import { BaseResponse } from '../common/base-response.dto';
import { AuthorizationDTO } from './authorization.dto';
import { AuthorizationResponseMapper } from './response.mapper';

export class AuthorizationResponse extends BaseResponse {
  constructor(data?: User) {
    super();
    if (data) {
      this.data = AuthorizationResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => AuthorizationDTO })
  data?: AuthorizationDTO = null;
}
