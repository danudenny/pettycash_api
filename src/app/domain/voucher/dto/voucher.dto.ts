import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { VoucherState } from '../../../../model/utils/enum';

export class VoucherDTO {
  @ApiProperty({
    description: 'Voucher ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Branch ID',
    example: '28786cd1-bb9e-4926-a332-3a2e1c302e68' //Medan
  })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    description: 'Branch Name',
    example: 'Medan' //Medan
  })
  @IsUUID()
  branchName: string;

  @ApiProperty( {
    description: 'Voucher Number',
    example: 'VCR202102ABC123'
  })
  number: string;

  @ApiProperty({
    description: 'Transaction Date',
    example: '2021-04-01'
  })
  transactionDate: Date;

  @ApiProperty( {
    description: 'Employee ID',
    example: '7278125a-b229-4b08-a5a6-17b829c45cb3'
  })
  employeeId: string

  @ApiProperty( {
    description: 'Employee NIK',
    example: '202011839'
  })
  employeeNik: string

  @ApiProperty( {
    description: 'Employee Name',
    example: 'Kendall Puspita'
  })
  employeeName: string

  @ApiProperty({
    description: 'Employee Position',
    example: 'Driver'
  })
  employeePosition: string

  @ApiProperty( {
    description: 'Check In Time',
    example: '2021-04-01T22:00:19Z'
  })
  checkinTime: Date;

  @ApiProperty( {
    description: 'Check Out Time',
    example: '2021-04-01T22:00:19Z'
  })
  checkoutTime: Date;

  @ApiProperty( {
    description: 'Total Amount',
    example: 100000
  })
  totalAmount: number;

  @ApiProperty( {
    description: 'Is Realized',
    example: false
  })
  isRealized: boolean;

  @ApiProperty( {
    description: 'Voucher State',
    example: VoucherState.DRAFT,
  })
  state: VoucherState;
}
