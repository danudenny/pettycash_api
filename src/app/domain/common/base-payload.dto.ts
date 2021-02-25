import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class BasePayload {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page Number',
  })
  @Transform((value) => value || 1)
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'The maximum number of results data to return.',
  })
  @Transform((value) => value || 10)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    example: '-createdAt',
    description:
      'Sort of field, `^` for Ascendent and `-` for Descendent, e.g: `-createdAt`',
  })
  @IsOptional()
  order: string;

  // fieldResolverMap: { [key: string]: string };
}
