import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class ReverseJournalDTO {
  @ApiPropertyOptional({
    description: 'Reverse Date',
    example: '2021-03-25',
  })
  @IsOptional()
  @IsISO8601({ strict: false })
  reverseDate?: Date;
}
