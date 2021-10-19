import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class EmployeeRoleDTO {
  @ApiProperty({
    description: 'Employee Role ID',
    example: 'e4a9d888-7c05-42b4-a596-dcd0d7a0f2d8',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Employee Role Id from Master Data',
    example: 490,
  })
  @IsNumber()
  employeeRoleId: Number;

  @ApiProperty({
    description: 'Role Code',
    example: 'DIR_CCO',
  })
  employeeRoleCode: string;

  @ApiProperty({
    description: 'Role Name',
    example: 'Direktorat Commercial',
  })
  employeeRoleName: string;

  @ApiProperty({
    description: 'Employee Role ID',
    example: '',
  })
  employeeLevel: string;

  @ApiProperty({
    description: 'Employee Role Position',
    example: '',
  })
  employeePosition: string;
}
