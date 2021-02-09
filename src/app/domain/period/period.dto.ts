import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class PeriodDTO {
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

  @ApiProperty({
    description: 'Closing Date in String ISO8601 DateOnly format',
    example: '2021-01-31',
  })
  @IsISO8601({ strict: false })
  closeDate: Date;

  @ApiProperty({
    description: 'Close User ID',
  })
  closeUserId: string;

  @ApiProperty({
    description: 'Close User FirstName',
  })
  closeUserFirstName: string;

  @ApiProperty({
    description: 'Close User LastName',
  })
  closeUserLastName: string;

  @ApiProperty({
    description: 'Close User NIK',
  })
  closeUserNIK: string;
}
