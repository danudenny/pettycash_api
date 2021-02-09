import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BasePayload {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page Number',
  })
  @Transform((value) => value || 1)
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'The maximum number of results data to return.',
  })
  @Transform((value) => value || 10)
  limit: number;

  @ApiPropertyOptional({
    example: '-transferDate',
    description:
      'Sort of field, `^` for Ascendent and `-` for Descendent, e.g: `-transferDate`',
  })
  order: string;

  // fieldResolverMap: { [key: string]: string };
}
