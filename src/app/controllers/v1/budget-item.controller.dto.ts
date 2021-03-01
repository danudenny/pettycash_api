import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BudgetItemService } from '../../services/v1/budget-item.service';
import { CreateBudgetItemDTO, UpdateBudgetItemDTO } from '../../domain/budget-item/budget-item-create.dto';
import { BudgetItemResponse, BudgetItemWithPaginationResponse } from '../../domain/budget-item/budgetItem-response.dto';
import { QueryBugdetItemDTO } from '../../domain/budget-item/budget-item.payload.dto';
import { FindBudgetItemIdParams } from '../../domain/budget-item/budget-item.dto';
import FindIdParams from '../../domain/common/findId-param.dto';

@Controller('v1/budget-items')
@ApiTags('Budget Item')
export class BudgetItemController {
  constructor(private budgetService: BudgetItemService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Budget Items' })
  @ApiOkResponse({ type: BudgetItemWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async find(@Query() query: QueryBugdetItemDTO) {
    return await this.budgetService.list(query);
  }

  @Get('budget/:budgetId')
  @ApiParam({ name: 'budgetId'})
  @ApiOperation({ summary: 'List all Budget Items in Budget' })
  @ApiOkResponse({ type: BudgetItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Param() { budgetId }: FindBudgetItemIdParams) {
    return await this.budgetService.find(budgetId);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Budget Item' })
  @ApiOkResponse({ type: BudgetItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateBudgetItemDTO) {
    return await this.budgetService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Budget Item' })
  @ApiOkResponse({ type: BudgetItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: UpdateBudgetItemDTO,
  ) {
    return await this.budgetService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Budget Item' })
  @ApiOkResponse({ type: BudgetItemResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.budgetService.delete(id);
  }
}
