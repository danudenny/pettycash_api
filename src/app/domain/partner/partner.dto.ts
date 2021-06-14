import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsUUID } from 'class-validator';

export class PartnerDTO {
  @ApiProperty({
    description: 'Partner ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Partner Code',
    example: 'HR_SICEPAT',
  })
  code: string;

  @ApiProperty({
    description: 'Partner Name',
    example: 'HR Sicepat',
  })
  name: string;

  @ApiProperty({
    description: 'Partner Address',
    example: 'Jl. Medan Merdeka 1, Jakarta Pusat, Indonesia',
  })
  address: string;

  @ApiProperty({
    description: 'Partner Type',
    example: 'company',
    enum: ['personal', 'company'],
  })
  type: string;

  @ApiProperty({
    description: 'Partner NPWP',
    example: '1232.1231.999-12.11',
  })
  npwpNumber: string;

  @ApiProperty({
    description: 'Partner ID Card Number (KTP)',
    example: '332211440920001',
  })
  idCardNumber: string;

  @ApiProperty({
    description: 'Partner State',
    example: 'draft',
    enum: ['draft', 'approved', 'rejected'],
  })
  state: string;

  @ApiProperty({
    description: 'Partner Status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Partner CreatedAt in string ISO8601 format',
    example: '2021-01-29T09:00:29.803Z',
  })
  @IsISO8601({ strict: false })
  createdAt: Date;
}
