import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { AccountTaxPartnerType } from '../../../model/utils/enum';

export class TaxDTO {
  @ApiProperty({
    description: 'Tax ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Tax Name',
    example: 'PPN',
  })
  name: string;

  @ApiProperty({
    description: 'Describe Tax is NPWP or not',
    example: true,
  })
  isHasNpwp: boolean;

  @ApiProperty({
    description: 'Tax percentage',
    example: 10,
  })
  taxInPercent: Number;

  @ApiProperty({
    description: 'Tax Partner Type',
    example: AccountTaxPartnerType.PERSONAL,
    enum: AccountTaxPartnerType,
  })
  partnerType: AccountTaxPartnerType;

  @ApiProperty({
    description: 'Coa ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b'
  })
  coaId?: string;

  @ApiProperty({
    description: 'Coa code',
    example: '500.10.11',
  })
  coaCode: string;

  @ApiProperty({
    description: 'Coa Name',
    example: 'Cash Transit Coa',
  })
  coaName: string;

}
