import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/allocation-balance.query.dto';
import { AllocationBalanceService } from '../../services/v1/allocation-balance.service';
import { AllocationBalanceResponse, AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response.dto';
import FindIdParams from '../../domain/common/findId-param.dto';
import { RejectAllocationDTO } from '../../domain/allocation-balance/allocation-balance.dto';
import { TransferBalanceDTO } from '../../domain/balance/transfer-balance.dto';
import { AllocationBalanceDetailResponse } from '../../domain/allocation-balance/allocation-balance-detail.dto';

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
  @ApiOkResponse({ type: AllocationBalanceDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.getById(id);
  }

  @Post('/transfer')
  @ApiOperation({ summary: 'Transfer Balance to Branch' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async transfer(@Body() data: TransferBalanceDTO) {
    return await this.allocBallanceService.transfer(data);
  }

  @Patch('/:id/approve')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Approve Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async approve(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.approve(id);
  }

  @Patch('/:id/reject')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
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

  @Patch('/:id/received')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Received Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async received(
    @Param() {id}: FindIdParams,
  ) {
    return await this.allocBallanceService.received(id);
  }
}
