import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateUserRoleDTO {
  @ApiProperty({
    description: 'Role ID to assign',
    example: '1e22a734-d813-4f11-8f9d-37feeccf7a4f',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'Branch to attach',
    examples: [
      '142648ab-9624-4a7a-a4b4-2f1c51e648d7',
      'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
    ],
  })
  @IsArray()
  branches: string[];
}
