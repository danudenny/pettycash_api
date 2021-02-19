import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { BasePayload } from '../common/base-payload.dto';

export class QueryUserRoleDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Employee Name',
    example: 'Adry',
  })
  @IsOptional()
  employee_name__contains: string;

  @ApiPropertyOptional({
    description: 'Period ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  @IsOptional()
  role_id: string;

  @ApiPropertyOptional({
    description: 'Employee NIK',
    example: '190000280',
  })
  @IsUUID()
  @IsOptional()
  nik: string;
}
