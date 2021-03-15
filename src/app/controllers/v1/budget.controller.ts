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

  @Get('/branch/:branchId')
  @ApiParam({ name: 'branchId' })
  @ApiOperation({ summary: 'Get Budget with Branch ID' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getBranch(
    @Param() { branchId }: FindBudgetIdParams,
  ) {
    return await this.budgetService.getBranch(branchId);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get Budget with ID' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async show(
    @Param() { id }: FindIdParams,
  ) {
    return await this.budgetService.show(id);
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

  @Post(':id/duplicate')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Duplicate Existing Budget' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async duplicate(
    @Param() { id }: FindIdParams,
  ) {
    const budgetDuplicate = await this.budgetService.duplicate(id);

    if(budgetDuplicate) {
      return budgetDuplicate;
    } else {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Budget' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: UpdateBudgetDTO,
  ) {
    return await this.budgetService.update(id, payload);
  }

  @Put('/:id/approve_by_ss')
  @ApiOperation({ summary: 'Approve Budget By Senior Supervisor' })
  @ApiOkResponse({
    description: 'Budget successfully approved by SS',
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to approve Budget' })
  public async approve_by_ss(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.budgetService.approve_by_ss(id);
  }

  @Put('/:id/approve_by_spv')
  @ApiOperation({ summary: 'Approve Budget By Supervisor' })
  @ApiOkResponse({
    description: 'Budget successfully approved by SPV',
    type: BudgetResponse,
  })
  @ApiBadRequestResponse({ description: 'Failed to approve Budget' })
  public async approve_by_spv(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.budgetService.approve_by_spv(id);
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
