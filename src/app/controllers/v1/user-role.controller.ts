import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserRoleDTO } from '../../domain/user-role/create-user-role.dto';
import { UserRoleResponse } from '../../domain/user-role/response.dto';
import { UpdateUserRoleDTO } from '../../domain/user-role/update-user-role.dto';
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

  @Post()
  @ApiOperation({ summary: 'Create user role mapping' })
  @ApiCreatedResponse({ description: 'User role mapping successfully' })
  @ApiBadRequestResponse({ description: 'Failed to mapping user role' })
  @ApiBody({ type: CreateUserRoleDTO })
  public async create(@Body() payload: CreateUserRoleDTO) {
    return await this.svc.create(payload);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user role mapping' })
  @ApiOkResponse({ description: 'User role mapping successfully updated' })
  @ApiBadRequestResponse({ description: 'Failed to update user role' })
  @ApiBody({ type: UpdateUserRoleDTO })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateUserRoleDTO,
  ) {
    return await this.svc.update(id, payload);
  }
}
