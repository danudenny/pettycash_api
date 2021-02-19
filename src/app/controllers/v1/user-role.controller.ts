import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleResponse } from '../../domain/user-role/response.dto';
import { QueryUserRoleDTO } from '../../domain/user-role/user-role.payload.dto';
import { UserRoleService } from '../../services/v1/user-role.service';

@Controller('v1/user-roles')
@ApiTags('User Role Mapping')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class UserRoleController {
  constructor(private svc: UserRoleService) {}

  @Get()
  @ApiOperation({ summary: 'List all user role mapping' })
  @ApiOkResponse({ type: UserRoleResponse })
  public async list(@Query() query: QueryUserRoleDTO) {
    return await this.svc.list(query);
  }
}
