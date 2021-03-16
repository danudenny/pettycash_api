import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { BasePayload } from '../common/base-payload.dto';

export class QueryUserDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'User Name',
    example: 'Adry',
  })
  @IsOptional()
  name__contains: string;

  @ApiPropertyOptional({
    description: 'User NIK or Username',
    example: '19000280',
  })
  @IsOptional()
  nik__contains: string;

  @ApiPropertyOptional({
    description: 'Filter user by has role or not',
    example: true,
  })
  @IsOptional()
  isHasRole?: boolean;
}
