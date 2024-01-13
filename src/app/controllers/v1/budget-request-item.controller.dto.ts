import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import FindIdParams from '../../domain/common/findId-param.dto';
import { BudgetRequestItemService } from '../../services/v1/budget-request-item.service';
import { BudgetRequestItemResponse, BudgetRequestItemWithPaginationResponse } from '../../domain/budget-request-item/budget-request-item-response.dto';
import { QueryBudgetRequestItemDTO } from '../../domain/budget-request-item/budget-request-item.payload.dto';
import { FindBudgetRequestItemIdParams } from '../../domain/budget-request-item/budget-request-item.dto';
import { CreateBudgetRequestItemDTO, UpdateBudgetRequestItemDTO } from '../../domain/budget-request-item/budget-request-item-create.dto';

@Controller('v1/budget-request-items')
@ApiTags('Budget Request Item')
export class BudgetRequestItemController {
  constructor(private budgetRequestService: BudgetRequestItemService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Budget Request Items' })
  @ApiOkResponse({ type: BudgetRequestItemWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Query() query: QueryBudgetRequestItemDTO) {
    return await this.budgetRequestService.list(query);
  }

  @Get('budget/:budgetRequestId')
  @ApiParam({ name: 'budgetRequestId'})
  @ApiOperation({ summary: 'List all Budget Request Items in Budget' })
  @ApiOkResponse({ type: BudgetRequestItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Param() { budgetRequestId }: FindBudgetRequestItemIdParams) {
    return await this.budgetRequestService.find(budgetRequestId);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Budget Request Item' })
  @ApiOkResponse({ type: BudgetRequestItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateBudgetRequestItemDTO) {
    return await this.budgetRequestService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Budget Request Item' })
  @ApiOkResponse({ type: BudgetRequestItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: UpdateBudgetRequestItemDTO,
  ) {
    return await this.budgetRequestService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Budget Request Item' })
  @ApiOkResponse({ type: BudgetRequestItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.budgetRequestService.delete(id);
  }
}
