import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateBranchDTO {
  @ApiPropertyOptional({
    description: 'Cash CoA ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  @IsOptional()
  coaId?: string;
}
