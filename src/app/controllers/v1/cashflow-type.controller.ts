import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation, ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CashflowTypeService } from '../../services/v1/cashflow-type.service';
import { CashflowTypeWithPaginationResponse } from '../../domain/cashflow-type/cashflow-type-response.dto';
import { QueryCashFlowTypeDTO } from '../../domain/cashflow-type/cashflow-type-query.dto';
import FindIdParams from '../../domain/common/findId-param.dto';
import { CreateCashflowTypeDto } from '../../domain/cashflow-type/cashflow-type-create.dto';

@Controller('v1/cashflow-type')
@ApiTags('Cashflow Type')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class CashflowTypeController {

  constructor(
    private readonly cashflowService: CashflowTypeService
  ) {}

  @Get('')
  @ApiOperation({ summary: 'List all Cashflow Type' })
  @ApiOkResponse({ status: HttpStatus.OK, type: CashflowTypeWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(
    @Query() query: QueryCashFlowTypeDTO,
  ): Promise<CashflowTypeWithPaginationResponse> {
    return await this.cashflowService.list(query);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Cashflow Type' })
  @ApiOkResponse({ description: 'Berhasil membuat kas masuk.' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateCashflowTypeDto) {
    return await this.cashflowService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Cashflow Type' })
  @ApiOkResponse({ description: 'Berhasil mengedit kas masuk.' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: CreateCashflowTypeDto,
  ) {
    return await this.cashflowService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Cashflow Type' })
  @ApiOkResponse({ description: 'Berhasil menghapus kas masuk.' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.cashflowService.delete(id);
  }

}