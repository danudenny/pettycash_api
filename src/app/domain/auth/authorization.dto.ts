import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

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
    description: 'First Name',
    example: 'Silvia',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Agustin',
  })
  lastName: string;

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
    example: ['period:read', 'period:close'],
  })
  permissions: string[];
}
