import { Controller, Get } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleResponse } from '../../domain/role/response.dto';
import { RoleService } from '../../services/v1/role.service';

@Controller('v1/roles')
@ApiTags('Role')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class RoleController {
  constructor(private svc: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @ApiOkResponse({ type: RoleResponse })
  public async list() {
    return await this.svc.list();
  }
}
