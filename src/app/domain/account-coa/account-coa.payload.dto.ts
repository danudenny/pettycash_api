import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryAccountCoaDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'CoA ID to filter',
    example: '551ecae4-f27c-49f7-a159-934739c2d426',
  })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    description: 'Search by CoA Code (using LIKE sql)',
    example: '500',
  })
  code__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by CoA Name (using LIKE sql)',
    example: 'Uang',
  })
  name__icontains: string;
}
