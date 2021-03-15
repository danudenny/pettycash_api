import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoanDetailResponse } from '../../domain/loan/response-detail.dto';
import { LoanWithPaginationResponse } from '../../domain/loan/response.dto';
import { LoanService } from '../../services/v1/loan.service';

@Controller('v1/loans')
@ApiTags('Loan')
@ApiInternalServerErrorResponse({ description: 'General Error' })
export class LoanController {
  constructor(private svc: LoanService) {}

  @Get()
  @ApiOperation({ summary: 'List all loan' })
  @ApiOkResponse({ type: LoanWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: any): Promise<any> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get detail loan' })
  @ApiOkResponse({ type: LoanDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<any> {
    return await this.svc.getById(id);
  }

  @Post('/:id/pay')
  @ApiOperation({ summary: 'Pay a Loan' })
  @ApiNotFoundResponse({ description: 'Loan not found' })
  @ApiBody({})
  public async pay(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: any,
  ) {
    return await this.svc.pay(id, payload);
  }
}
