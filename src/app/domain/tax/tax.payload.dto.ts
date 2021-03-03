import { BasePayload } from '../common/base-payload.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountTaxPartnerType } from '../../../model/utils/enum';

export class QueryTaxDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Tax Name',
    example: 'PPn',
  })
  name__icontains: string;

  @ApiProperty({
    description: 'Tax Partner Type',
    example: 'personal',
    enum: ['company', 'personal'],
  })
  partnerType: AccountTaxPartnerType;

}
