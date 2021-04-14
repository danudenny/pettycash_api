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
import FindIdParams from '../../domain/common/findId-param.dto';
import { BudgetRequestService } from '../../services/v1/budget.request.service';
import { BudgetRequestResponse, BudgetRequestWithPaginationResponse } from '../../domain/budget-request/budget-request-response.dto';
import { QueryBudgetRequestDTO } from '../../domain/budget-request/budget-request.payload.dto';
import { BudgetRequestDetailResponse } from '../../domain/budget-request/budget-request-detail-response.dto';
import { CreateBudgetRequestDTO, RejectBudgetRequestDTO, UpdateBudgetRequestDTO } from '../../domain/budget-request/budget-request-createUpdate.dto';
import { BudgetResponse } from '../../domain/budget/budget-response.dto';

@Controller('v1/budget-requests')
@ApiTags('Budget Request')
export class BudgetRequestController {
  constructor(private budgetRequestService: BudgetRequestService) {
  }

  @Get('')
  @ApiOperation({ summary: 'List all Budgets Request' })
  @ApiOkResponse({ type: BudgetRequestWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryBudgetRequestDTO) {
    return await this.budgetRequestService.list(query);
  }

  @Get('/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Get Budget Request with ID' })
  @ApiOkResponse({ type: BudgetRequestDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async show(
    @Param() { id }: FindIdParams,
  ) {
    return await this.budgetRequestService.getById(id);
  }

  @Get('/get-budget/:needDate')
  @ApiParam({ name: 'needDate' })
  @ApiOperation({ summary: 'Get Budget Data by Need Date' })
  @ApiOkResponse({ type: BudgetResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getBudget(
    @Param('needDate') needDate: Date,
  ) {
    return await this.budgetRequestService.getBudget(needDate);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Budget Request' })
  @ApiCreatedResponse({
    type: BudgetRequestResponse,
    description: 'Budget Request Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateBudgetRequestDTO })
  public async create(@Body() payload: CreateBudgetRequestDTO) {
    return await this.budgetRequestService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Budget Request' })
  public async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateBudgetRequestDTO,
  ) {
    return await this.budgetRequestService.update(id, payload);
  }

  @Put('/:id/approve')
  @ApiOperation({ summary: 'Approve Budget Request' })
  // @ApiOkResponse({
  //   description: 'Budget Request successfully approved',
  //   type: BudgetRequestResponse,
  // })
  // @ApiBadRequestResponse({ description: 'Failed to approve Budget Request' })
  public async approve(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.budgetRequestService.approve(id);
  }

  @Put('/:id/reject')
  @ApiOperation({ summary: 'Reject Budget Request' })
  // @ApiOkResponse({
  //   description: 'Budget Request successfully rejected',
  //   type: BudgetRequestResponse,
  // })
  // @ApiBadRequestResponse({ description: 'Failed to reject Budget Request' })
  @ApiBody({ type: RejectBudgetRequestDTO })
  public async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: RejectBudgetRequestDTO
  ) {
    return await this.budgetRequestService.reject(id, data);
  }

  @Put('/:id/cancel')
  @ApiOperation({ summary: 'Cancel Budget Request' })
  // @ApiOkResponse({
  //   description: 'Budget Request successfully Canceled',
  //   type: BudgetRequestResponse,
  // })
  // @ApiBadRequestResponse({ description: 'Failed to cancel Budget Request' })
  public async cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.budgetRequestService.cancel(id);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Budget Request' })
  @ApiOkResponse({ type: BudgetRequestResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.budgetRequestService.delete(id);
  }
}
