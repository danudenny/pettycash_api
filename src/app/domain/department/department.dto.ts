import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DepartmentDTO {
  @ApiProperty({
    description: 'Department ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Department Id from Master Data',
    example: 10,
  })
  departmentId: Number;

  @ApiProperty({
    description: 'Parent of Department',
    example: 1,
  })
  departmentParentId: Number;

  @ApiProperty({
    description: 'Department Code',
    example: 'DP001',
  })
  code: string;

  @ApiProperty({
    description: 'Department Name',
    example: 'Accounting',
  })
  name: string;

  @ApiProperty({
    description: 'Department isActive',
    example: 'true',
  })
  isActive: boolean;
}
