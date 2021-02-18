import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { AccountTaxPartnerType } from '../../../model/utils/enum';

export class CreateTaxDTO {
  @ApiProperty({
    description: 'Tax Name',
    example: 'PPn',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tax has NPWP or Not',
    example: true,
  })
  @IsBoolean()
  isHasNpwp: boolean;

  @ApiProperty({
    description: 'Tax Percentage',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  taxInPercent: number;

  @ApiProperty({
    description: 'Partner Type',
    example: 'company',
    enum: ['personal','company'],
  })
  partnerType: AccountTaxPartnerType;

  @ApiProperty({
    description: 'Coa of Tax',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  coaId: string;
}
