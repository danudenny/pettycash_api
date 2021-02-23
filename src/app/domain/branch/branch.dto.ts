import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BranchDTO {
  @ApiProperty({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Branch Code',
    example: '1302006',
  })
  code: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Tangerang Pinang',
  })
  name: string;
}
