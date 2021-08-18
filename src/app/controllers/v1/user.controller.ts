import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserWithPaginationResponse } from '../../domain/user/response.dto';
import { UserResetPasswordeDTO } from '../../domain/user/user-reset-password.dto';
import { QueryUserDTO } from '../../domain/user/user.payload.dto';
import { UserService } from '../../services/v1/user.service';

@Controller('v1/users')
@ApiTags('User')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class UserController {
  constructor(private svc: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List all user role mapping' })
  @ApiOkResponse({ type: UserWithPaginationResponse })
  public async list(@Query() query: QueryUserDTO) {
    return await this.svc.list(query);
  }

  // TODO: handle with care
  @Post('resetPassword')
  @ApiOperation({ summary: 'integration reset password master data' })
  public async resetPassword(@Body() payload: UserResetPasswordeDTO) {
    return await this.svc.resetPassword(payload);
  }
}
