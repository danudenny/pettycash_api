import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/allocation-balance.query.dto';
import { AllocationBalanceService } from '../../services/v1/allocation-balance.service';
import { AllocationBalanceResponse, AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response.dto';
import FindIdParams from '../../domain/common/findId-param.dto';
import { RejectAllocationDTO } from '../../domain/allocation-balance/allocation-balance.dto';

@Controller('v1/allocation-balance')
@ApiTags('Cash Allocation Balance')
export class AllocationBalanceController {
  constructor(private allocBallanceService: AllocationBalanceService) {
  }

  @Get('')
  @ApiOperation({ summary: 'List all Allocation Balance' })
  @ApiOkResponse({ type: AllocationBalanceWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: AllocationBalanceQueryDTO) {
    return await this.allocBallanceService.list(query);
  }

  @Get('/:id')
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Get Allocation Balance by ID' })
  @ApiOkResponse({ type: AllocationBalanceResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.find(id);
  }

  @Patch('/:id/approve')
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Approve Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async approve(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.approve(id);
  }

  @Patch('/:id/reject')
  @ApiParam({name: 'id'})
  @ApiBody({ type: RejectAllocationDTO })
  @ApiOperation({ summary: 'Reject Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async reject(
    @Param() {id}: FindIdParams,
    @Body() payload: RejectAllocationDTO,
  ) {
    return await this.allocBallanceService.reject(id, payload);
  }
}
