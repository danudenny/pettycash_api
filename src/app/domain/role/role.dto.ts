import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RoleDTO {
  @ApiProperty({
    description: 'Role ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Role Name',
    example: 'ACCOUNTING',
  })
  name: string;
}
