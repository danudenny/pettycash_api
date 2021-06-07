import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PartnerState } from '../../../model/utils/enum';

export class UpdatePartnerDTO {
  @ApiPropertyOptional({
    description: 'Partner Name',
    example: 'HR Sicepat',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Partner Type',
    example: 'company',
    enum: PartnerState,
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Partner NPWP',
    example: '1232.1231.999-12.11',
  })
  @IsOptional()
  npwpNumber: string;

  @ApiPropertyOptional({
    description: 'Partner ID Card Number (KTP)',
    example: '332211440920001',
  })
  @IsOptional()
  idCardNumber: string;

  @ApiPropertyOptional({
    description: 'Partner Address',
    example: 'Jl. Medan Merdeka 1, Jakarta Pusat, Indonesia',
  })
  @IsOptional()
  address: string;

  @ApiPropertyOptional({
    description: 'Partner Is Active',
    example: true
  })
  isActive: boolean;
}
