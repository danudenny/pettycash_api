import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';
import {
  DownPaymentPayType,
  DownPaymentState,
  DownPaymentType,
} from '../../../model/utils/enum';

export class QueryDownPaymentDTO extends BasePayload {
  @ApiPropertyOptional({ description: 'Start Date', example: '2021-01-01' })
  startDate__gte: Date;

  @ApiPropertyOptional({ description: 'End Date', example: '2021-12-31' })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Department ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  departmentId: string;

  @ApiPropertyOptional({
    description: 'State Down Payment',
    example: DownPaymentState.DRAFT,
    enum: DownPaymentState,
  })
  state: DownPaymentState;

  @ApiPropertyOptional({
    description: 'Down Payment Type',
    example: DownPaymentType.REIMBURSEMENT,
    enum: DownPaymentType,
  })
  type: DownPaymentType;

  @ApiPropertyOptional({
    description: 'Payment Type',
    example: DownPaymentPayType.CASH,
    enum: DownPaymentPayType,
  })
  paymentType: DownPaymentPayType;

  @ApiPropertyOptional({ description: 'Destination', example: 'jakarta' })
  destinationPlace: string;

  @ApiPropertyOptional({ description: 'Down Pament Number', example: 'UM001' })
  number__icontains: string;
}
