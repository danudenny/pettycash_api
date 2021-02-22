import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
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
}
