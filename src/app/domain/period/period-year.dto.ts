import { ApiProperty } from '@nestjs/swagger';

export class PeriodYearDTO {
  @ApiProperty({
    description: 'Period Year',
    example: 2021,
  })
  year: Number;
}
