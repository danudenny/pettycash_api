import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBudgetItemDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Budget ID',
    example: '46dc5599-43f0-4569-b5f0-33e25f4cd29c',
  })
  budgetId: string;

  @ApiPropertyOptional({
    description: 'Product ID',
    example: 'd786c337-39b5-40ab-952b-48cd186027bd',
  })
  productId: string;

}
