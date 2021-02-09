import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PeriodYearDTO {
  @ApiProperty({
    description: 'Period ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Period Name',
    example: 'Period 1',
  })
  name: string;

  @ApiProperty({
    description: 'Period Month',
    example: 1,
  })
  month: Number;

  @ApiProperty({
    description: 'Period Year',
    example: 2021,
  })
  year: Number;

  @ApiProperty({
    description: 'Period Status',
    example: 'open',
    enum: ['open', 'close'],
  })
  state: string;
}
