import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserBranchDTO {
  @ApiProperty({
    description: 'User ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'First Name',
    example: 'Agustin',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Accountant',
  })
  lastName: string;

  @ApiProperty({
    description: 'Branch ID relates to this user',
  })
  branchIds: Array<string>;
}
