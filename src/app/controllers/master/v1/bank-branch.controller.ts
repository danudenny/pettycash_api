import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryBankBranchDTO } from '../../../domain/bank-branch/bank-branch.query.dto';
import { BankBranchService } from '../../../services/master/v1/bank-branch.service';
import { BankBranchWithPaginationResponse } from '../../../domain/bank-branch/response.dto';

@ApiTags('Bank Branch')
@Controller('v1/bank-branches')
export class BankBranchController {
  constructor(private svc: BankBranchService) {}

  @Get()
  @ApiOperation({ summary: 'List all Bank Branch' })
  @ApiOkResponse({ type: BankBranchWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  public async list(@Query() query: QueryBankBranchDTO) {
    return await this.svc.list(query);
  }
}
