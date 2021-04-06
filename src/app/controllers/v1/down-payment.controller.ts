import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
/** Interfaces */
import { QueryDownPaymentDTO } from '../../domain/down-payment/down-payment-query.dto';
import { CreateDownPaymentDTO } from '../../domain/down-payment/down-payment-create.dto';
import { RejectDownPaymentDTO } from '../../domain/down-payment/down-payment-reject.dto';
import { ApproveDownPaymentDTO } from '../../domain/down-payment/down-payment-approve.dto';
import {
  DownPaymentResponse,
  ShowDownPaymentResponse,
  DownPaymentsWithPaginationResponse,
} from '../../domain/down-payment/down-payment-response.dto';
/** Services */
import { DownPaymentService } from '../../services/v1/down-payment.service';

@ApiTags('Down Payments')
@ApiInternalServerErrorResponse({ description: 'General Error' })
@Controller('v1/down-payments')
export class DownPaymentController {
  constructor(private readonly downPaymentService: DownPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create Expense' })
  @ApiCreatedResponse({
    type: DownPaymentResponse,
    description: 'Expense Successfully Created',
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiBody({ type: CreateDownPaymentDTO })
  async addDownPayment(@Body() actCreate: CreateDownPaymentDTO) {
    try {
      return this.downPaymentService.createDownPayment(actCreate);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all down payments' })
  @ApiOkResponse({ type: DownPaymentsWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAll(
    @Query() query: QueryDownPaymentDTO,
  ): Promise<DownPaymentsWithPaginationResponse> {
    try {
      return this.downPaymentService.getAll(query);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Show down payment' })
  @ApiOkResponse({ type: ShowDownPaymentResponse })
  @ApiNotFoundResponse({ description: 'Down paymant not found' })
  async show(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const dwnPy = await this.downPaymentService.findOne({
        id,
        isDeleted: false,
      });
      if (!dwnPy)
        throw new NotFoundException({
          status: 'fail',
          code: 'DOWN_PAYMENT_NOT_FOUND',
          message: `Down Payment ID ${id} not found!`,
          traceId: id,
        });

      return await this.downPaymentService.showOne(id);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('/:id/approve')
  @ApiOperation({ summary: 'Approve Down Payment' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: ApproveDownPaymentDTO })
  async approveDownPaymant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() actApprove: ApproveDownPaymentDTO,
  ) {
    try {
      return await this.downPaymentService.approveDownPayment(id, actApprove);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch('/:id/reject')
  @ApiOperation({ summary: 'Reject Down Payment' })
  @ApiHeader({ name: 'x-username', description: 'Custom User Request' })
  @ApiBody({ type: RejectDownPaymentDTO })
  async rejectDownPaymant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() actReject: RejectDownPaymentDTO,
  ) {
    try {
      return await this.downPaymentService.rejectDownPayment(id, actReject);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
