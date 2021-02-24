import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { MASTER_ROLES } from '../../../model/utils/enum';

export class AuthorizationDTO {
  @ApiProperty({
    description: 'User ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'username',
    example: '190000280',
  })
  username: string;

  @ApiProperty({
    description: 'Role ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'Role Name',
    example: 'ACCOUNTING',
  })
  roleName: string;

  @ApiProperty({
    description: 'Permissions',
    examples: ['period:read', 'period:close'],
  })
  permissions: string[];
}
