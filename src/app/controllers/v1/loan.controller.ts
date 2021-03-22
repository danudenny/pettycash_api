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
import { CreatePaymentLoanDTO } from '../../domain/loan/create-payment.dto';
import { QueryLoanDTO } from '../../domain/loan/loan.query.dto';
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
  public async list(
    @Query() query: QueryLoanDTO,
  ): Promise<LoanWithPaginationResponse> {
    return await this.svc.list(query);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get detail loan' })
  @ApiOkResponse({ type: LoanDetailResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LoanDetailResponse> {
    return await this.svc.getById(id);
  }

  @Post('/:id/payments')
  @ApiOperation({ summary: 'Create/Add Payments to Loan' })
  @ApiNotFoundResponse({ description: 'Loan not found' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreatePaymentLoanDTO })
  public async pay(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: CreatePaymentLoanDTO,
  ) {
    return await this.svc.pay(id, payload);
  }
}
