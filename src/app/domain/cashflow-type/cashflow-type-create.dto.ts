import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCashflowTypeDto {
  @ApiProperty({
    description: 'Jenis Kas Masuk',
    example: 'Kas Masuk'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Coa ID',
    example: 'bc598bc8-aefd-44f1-92cf-2a3a0f1f2750'
  })
  @IsUUID()
  coaId: string

  @ApiProperty({
    description: 'Kas Masuk Aktif',
    example: true
  })
  isActive: boolean;

}