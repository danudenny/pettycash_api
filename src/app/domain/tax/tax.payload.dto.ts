import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTaxDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Tax Name',
    example: 'PPn',
  })
  name: string;

}
