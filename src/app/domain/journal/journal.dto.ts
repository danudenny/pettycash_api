import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class JournalDTO {
  @ApiProperty({
    description: 'Journal ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  // TODO: Implement DTO
}
