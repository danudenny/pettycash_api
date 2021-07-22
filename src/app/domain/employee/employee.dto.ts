import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class EmployeeDTO {
  @ApiProperty({
    description: 'Employee ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Employee Id from Master Data',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  employeeId: Number;

  @ApiProperty({
    description: 'Nomor Induk Karyawan',
    example: '20090134',
  })
  @IsNotEmpty()
  @IsString()
  nik: string;

  @ApiProperty({
    description: 'Employee Name',
    example: 'Denny Danuwijaya',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Employee Position ID',
    example: 10,
  })
  @IsString()
  positionId: Number;

  @ApiProperty({
    description: 'Employee Position Name',
    example: 'Backend Developer',
  })
  @IsOptional()
  @IsString()
  positionName: string;

  @ApiProperty({
    description: 'Employee Branch ID',
    example: 1,
  })
  @IsOptional()
  branchId: Number;

}
