import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
    description: 'Employee Role ID',
    example: 10,
  })
  @IsString()
  employeeRoleId: Number;

  @ApiProperty({
    description: 'Employee Role Name',
    example: 'Admin Asset',
  })
  @IsString()
  positionName: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Jakarta Pusat',
  })
  branchName: string;

  @ApiProperty({
    description: 'Employee Branch ID',
    example: 1,
  })
  @IsOptional()
  branchId: Number;

  @ApiProperty({
    description: 'Entry Date',
    example: '2019-08-19 00:00:00',
  })
  dateOfEntry: Date;

  @ApiProperty({
    description: 'Resgin Date',
    example: '2019-08-19 00:00:00',
  })
  dateOfResign: Date;

  @ApiProperty({
    description: 'Employee Status',
    example: true,
  })
  employeeStatus: boolean;
}

export class EmployeeProductDTO {
  @ApiProperty({
    description: 'Employee VOucher Item ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Allowance Code / Name',
    example: 'UANG_BENSIN',
  })
  @IsNotEmpty()
  @IsString()
  allowanceCode: string;

  @ApiProperty({
    description: 'Allowance Amount',
    example: '20000',
  })
  @IsNotEmpty()
  allowanceAmount: number;

  @ApiProperty({
    description: 'Voucher Item ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  productId: string;
}
