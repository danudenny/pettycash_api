import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TaxService } from '../../../services/master/v1/tax.service';
import { QueryTaxDTO } from '../../../domain/tax/tax.payload.dto';
import { TaxResponse, TaxWithPaginationResponse } from '../../../domain/tax/tax-response.dto';
import FindIdParams from '../../../domain/common/findId-param.dto';
import { CreateTaxDTO } from '../../../domain/tax/create-tax.dto';
import { UpdateTaxDTO } from '../../../domain/tax/update-tax.dto';

@Controller('v1/tax')
@ApiTags('Account Tax')
export class TaxController {
  constructor(private taxService: TaxService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Taxes' })
  @ApiOkResponse({ type: TaxWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryTaxDTO){
    return await this.taxService.list(query);
  }

  @Post('')
  @ApiOperation({ summary: 'Create Tax' })
  @ApiOkResponse({ type: TaxResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async create(@Body() payload: CreateTaxDTO) {
    return await this.taxService.create(payload);
  }

  @Patch(':id/update')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Edit Tax' })
  @ApiOkResponse({ type: TaxResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async update(
    @Param() { id }: FindIdParams,
    @Body() payload: UpdateTaxDTO,
  ) {
    return await this.taxService.update(id, payload);
  }

  @Delete(':id/delete')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Delete Tax' })
  @ApiOkResponse({ type: TaxResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async delete(@Param() { id }: FindIdParams) {
    return await this.taxService.delete(id);
  }
}
