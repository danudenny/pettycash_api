import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryAuthorizationDTO } from '../../domain/auth/authorization.payload.dto';
import { AuthorizationResponse } from '../../domain/auth/response.dto';
import { AuthService } from '../../services/v1/auth.service';

@Controller('v1/authorizations')
@ApiTags('Authorization')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class AuthController {
  constructor(private svc: AuthService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user authorization info',
    description:
      'If params `username` is provided will check the authorization info by these params ' +
      'otherwise will use http header `X-username` to check username.',
  })
  @ApiOkResponse({ type: AuthorizationResponse })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async get(@Query() query?: QueryAuthorizationDTO) {
    return await this.svc.get(query);
  }
}
