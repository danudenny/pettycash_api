import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserBranchService } from '../../services/v1/user-branch.service';
import { UserBranchResponse } from '../../domain/user-branch/response.dto';

@Controller('v1/user-branch')
@ApiTags('User Branch list')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class UserBranchController {
  constructor(private svc: UserBranchService) {}

  @Get('/:xusername')
  @ApiOperation({ summary: 'Get user with branch id list' })
  @ApiOkResponse({ type: UserBranchResponse })
  public async get(@Param('xusername') xUsername: string) {
    return await this.svc.get(xUsername);
  }
}
