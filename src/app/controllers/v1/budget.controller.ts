import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BudgetService } from '../../services/v1/budget.service';
import { BudgetResponse, BudgetWithPaginationResponse } from '../../domain/budget/budget-response.dto';
import { QueryBugdetDTO } from '../../domain/budget/budget.payload.dto';
import FindIdParams from '../../domain/common/findId-param.dto';
import { CreateBudgetDTO, RejectBudgetDTO, UpdateBudgetDTO } from '../../domain/budget/budget-createUpdate.dto';
import { FindBudgetIdParams } from '../../domain/budget/budget.dto';
import { BudgetDetailResponse } from '../../domain/budget/budget-detail-response.dto';

@Controller('v1/budgets')
@ApiTags('Budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {
  }

  @Get('')
  @ApiOperation({ summary: 'List all Budgets' })
  @ApiOkResponse({ type: BudgetWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryBugdetDTO) {
    return await this.budgetService.list(query);
  }

  // @Get('/branch/:branchId')
  // @ApiParam({ name: 'branchId' })
  // @ApiOperation({ summary: 'Get Budget with Branch ID' })
  // @ApiOkResponse({ type: BudgetResponse })
  // @ApiBadRequestResponse({ description: 'Bad Request' })
  // public async getBranch(
  //   @Param() { branchId }: FindBudgetIdParams,
  // ) {
  //   return await this.budgetService.getBranch(branchId);
  // }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get Budget with ID' })
  @ApiOkResponse({ type: BudgetDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async show(
    @Param() { id }: FindIdParams,
  ) {
    return await this.budgetService.getById(id);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Budget' })
  @ApiCreatedResponse({
    type: BudgetResponse,
    description: 'Budget Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateBudgetDTO })
  public async create(@Body() payload: CreateBudgetDTO) {
    return await this.budgetService.create(payload);
  }

  @Get('/:id/duplicate')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get Budget with ID For Duplicate' })
  @ApiOkResponse({ type: BudgetDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async showDataDuplicate(
    @Param() { id }: FindIdParams,
  ) {
    return await this.budgetService.getById(id);
  }

  @Post('duplicate')
  @ApiOperation({ summary: 'Duplicate Existing Budget' })
  @ApiCreatedResponse({
    type: BudgetResponse,
    description: 'Budget Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateBudgetDTO })
  public async duplicate(@Body() payload: CreateBudgetDTO) {
    return await this.budgetService.createDuplicate(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Budget' })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateBudgetDTO,
  ) {
    return await this.budgetService.update(id, payload);
  }

  @Put('/:id/approve')
  @ApiOperation({ summary: 'Approve Budget' })
  @ApiOkResponse({
    description: 'Budget successfully approved',
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to approve Budget' })
  public async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.budgetService.approve(id);
  }

  @Put('/:id/reject')
  @ApiOperation({ summary: 'Reject Budget' })
  @ApiOkResponse({
    description: 'Budget successfully rejected',
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to reject Budget' })
  public async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: RejectBudgetDTO
  ) {
    return await this.budgetService.reject(id, data);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Budget' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.budgetService.delete(id);
  }
}
