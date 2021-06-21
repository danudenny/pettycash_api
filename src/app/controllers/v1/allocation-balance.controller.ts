import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/dto/allocation-balance.query.dto';
import { AllocationBalanceService } from '../../services/v1/allocation-balance.service';
import { AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response/response.dto';
import FindIdParams from '../../domain/common/findId-param.dto';
import { PaidAllocationDTO, RejectAllocationDTO } from '../../domain/allocation-balance/dto/allocation-balance.dto';
import { TransferBalanceDTO } from '../../domain/balance/transfer-balance.dto';
import { AllocationBalanceDetailResponse } from '../../domain/allocation-balance/dto/allocation-balance-detail.dto';
import { RevisionAllocationBalanceDTO } from '../../domain/allocation-balance/dto/allocation-balance-revision.dto';
import { CreateAllocationBalanceDto } from '../../domain/allocation-balance/dto/create-allocation-balance.dto';

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
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiOperation({ summary: 'Get Allocation Balance by ID' })
  @ApiOkResponse({ type: AllocationBalanceDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.allocBallanceService.getById(id);
  }

  @Post('/transfer')
  @ApiOperation({ summary: 'Transfer Balance to Branch' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async transfer(@Body() data: TransferBalanceDTO) {
    return await this.allocBallanceService.transfer(data);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Create Cash Balance Allocation' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async create(@Body() data: CreateAllocationBalanceDto) {
    return await this.allocBallanceService.create(data);
  }

  @Patch('/:id/approve')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Approve Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async approve(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.approve(id);
  }

  @Patch('/:id/cancel')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Cancel Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async cancel(@Param() {id}: FindIdParams) {
    return await this.allocBallanceService.cancel(id);
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

  @Put('/:id/revision')
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiParam({name: 'id'})
  @ApiOperation({ summary: 'Revision Cash Allocation Balance' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async revision(
    @Param() {id}: FindIdParams,
    @Body() data: RevisionAllocationBalanceDTO
  ) {
    return await this.allocBallanceService.revision(id, data);
  }

  @Patch('/:number/paid')
  @ApiParam({name: 'number'})
  @ApiOperation({ summary: 'Change status paid from odoo' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async paid(
    @Param('number') number,
    payload: PaidAllocationDTO,
  ) {
    return await this.allocBallanceService.isPaid(number, payload);
  }
}
