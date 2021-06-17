import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CashflowTypeDto {
  @ApiProperty({
    description: 'CashFlow Type ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Jenis Kas Masuk',
    example: 'Kas Masuk'
  })
  name: string;

  @ApiProperty({
    description: 'Coa Code',
    example: '700.001.000'
  })
  coaCode: string;

  @ApiProperty({
    description: 'Kas Masuk Aktif',
    example: true
  })
  isActive: boolean;

}