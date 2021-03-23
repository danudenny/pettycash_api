import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AllocationBalanceQueryDTO } from '../../domain/allocation-balance/allocation-balance.query.dto';
import { AllocationBalanceService } from '../../services/v1/allocation-balance.service';
import { AllocationBalanceResponse, AllocationBalanceWithPaginationResponse } from '../../domain/allocation-balance/response.dto';
import FindIdParams from '../../domain/common/findId-param.dto';

@Controller('v1/allocation-balance')
@ApiTags('Allocation Balance')
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
}
