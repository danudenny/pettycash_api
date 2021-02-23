import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBranchDTO } from '../../../domain/branch/branch.query.dto';
import { BranchWithPaginationResponse } from '../../../domain/branch/response.dto';
import { BranchService } from '../../../services/master/v1/branch.service';

@ApiTags('Branch')
@Controller('v1/branches')
export class BranchController {
  constructor(private svc: BranchService) {}

  @Get()
  @ApiOperation({ summary: 'List all Branch' })
  @ApiOkResponse({ type: BranchWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryBranchDTO) {
    return await this.svc.list(query);
  }
}
