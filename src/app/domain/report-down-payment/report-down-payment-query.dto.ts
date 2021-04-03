import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePayload } from '../common/base-payload.dto';

export class QueryReportDownPaymentDTO extends BasePayload {
  @ApiPropertyOptional({ description: 'Start Date', example: '2021-01-01' })
  startDate__gte: Date;

  @ApiPropertyOptional({ description: 'End Date', example: '2021-12-31' })
  endDate__lte: Date;

  @ApiPropertyOptional({description: 'Branch ID',example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',})
  branchId: string;
  
  @ApiPropertyOptional({description: 'Realized', example: 'sudah_realisasi',})
  realized: string;

}
