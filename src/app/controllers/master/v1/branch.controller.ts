import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
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
  @ApiHeader({
    name: 'x-username',
    description: 'User Request',
    required: false,
  })
  public async list(@Query() query: QueryBranchDTO) {
    return await this.svc.list(query);
  }

  @Get('/budgets')
  @ApiOperation({ summary: 'List all Branch for Budget' })
  @ApiOkResponse({ type: BranchWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiHeader({
    name: 'x-username',
    description: 'User Request',
    required: false,
  })
  public async listForBudget(@Query() query: QueryBranchDTO) {
    return await this.svc.listForBudget(query);
  }
}
