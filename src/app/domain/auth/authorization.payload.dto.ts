import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryAuthorizationDTO {
  @ApiPropertyOptional({
    description: 'username',
    example: '190000280',
  })
  @IsOptional()
  username: string;
}
