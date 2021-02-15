import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AccountCoaDTO {
  @ApiProperty({
    description: 'CoA ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'CoA Code',
    example: '500.100.11',
  })
  code: string;

  @ApiProperty({
    description: 'CoA Name',
    example: 'Uang Makan',
  })
  name: string;
}
