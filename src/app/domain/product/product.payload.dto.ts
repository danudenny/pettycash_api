import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductTaxType } from '../../../model/utils/enum';

export class QueryProductDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Product Code',
    example: 'PR00001',
  })
  code__contains: string;

  @ApiPropertyOptional({
    description: 'Product Name',
    example: 'Tiket Pesawat',
  })
  name__contains: string;

  @ApiPropertyOptional({
    description: 'Product Tax Having',
    example: true,
  })
  isHasTax: boolean;

  @ApiPropertyOptional({
    description: 'Tax Type of Product',
    example: ProductTaxType.SEWA_ALAT_DAN_KENDARAAN,
  })
  taxType: ProductTaxType;
}
