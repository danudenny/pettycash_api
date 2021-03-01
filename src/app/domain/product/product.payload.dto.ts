import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

}
