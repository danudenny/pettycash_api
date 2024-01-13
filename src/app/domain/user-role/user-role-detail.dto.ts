import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UserRoleBranchDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Kebon Jeruk',
  })
  name: string;
}

export class UserRoleDetailDTO {
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

  @ApiProperty({
    description: 'User Assigned Branch(es)',
    type: [UserRoleBranchDTO],
  })
  @IsArray()
  branches: UserRoleBranchDTO[];
}
