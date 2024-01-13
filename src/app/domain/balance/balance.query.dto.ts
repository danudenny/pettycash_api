import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import { BasePayload } from '../common/base-payload.dto';

export class QueryBalanceDTO {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page Number',
  })
  @Transform((value) => value || 1)
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'The maximum number of results data to return.',
  })
  @Transform((value) => value || 10)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Balance Date to filter',
    example: '2020-03-15',
  })
  balanceDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID to filter',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsOptional()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({
    description: 'Balance State for filter to `differenceAmount`',
    example: 'lessThan',
    enum: ['lessThan', 'equal', 'moreThan'],
  })
  state: string;

}

export class QueryReportBalanceDTO extends BasePayload {
  @ApiPropertyOptional({
    example: '2020-03-15',
  })
  dateStart__gte: Date

  @ApiPropertyOptional({
    example: '2020-03-15',
  })
  dateEnd__lte: Date

  @ApiPropertyOptional({
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsOptional()
  @IsUUID()
  branchId: string
}
