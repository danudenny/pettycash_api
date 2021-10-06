import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPenggunaanKendaraanDTO {
  @ApiPropertyOptional({
    example: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    example: 50,
  })
  limit?: number;

  @ApiPropertyOptional({
    example: '2021-09-14',
  })
  start_date?: any;

  @ApiPropertyOptional({
    example: '2021-09-15',
  })
  end_date?: any;

  @ApiPropertyOptional({
    example: 'c3fc7b11-a003-4e1c-b0f3-0367cfee65fc',
  })
  branch_id?: string;
}
