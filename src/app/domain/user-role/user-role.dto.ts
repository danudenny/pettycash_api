import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserRoleDTO {
  @ApiProperty({
    description: 'User ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'User NIK',
    example: '190000280',
  })
  nik: string;

  @ApiProperty({
    description: 'username',
    example: '190000280',
  })
  username: string;

  @ApiProperty({
    description: 'Full Name',
    example: 'Agustin Accountant',
  })
  fullName: string;

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
}
