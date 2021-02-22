import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserDTO {
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
    description: 'First Name',
    example: 'Agustin',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Accountant',
  })
  lastName: string;
}
