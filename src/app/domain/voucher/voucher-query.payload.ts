import { BasePayload } from '../common/base-payload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherState } from '../../../model/utils/enum';
import { IsOptional } from 'class-validator';

export class QueryVoucherDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Voucher Start Date',
    example: '2021-01-01',
  })
  startDate__gte: Date;

  @ApiPropertyOptional({
    description: 'Voucher End Date',
    example: '2021-12-31',
  })
  endDate__lte: Date;

  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  branchId: string;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  employeeId: string;

  @ApiPropertyOptional({
    description: 'Voucher Number',
    example: 'VCR/2021/Ap/A28134',
  })
  number__icontains: string;

  @ApiPropertyOptional({
    description: 'Voucher State',
    example: 'draft',
    enum: VoucherState,
  })
  state: VoucherState;
}

export class QueryVoucherSunfishDTO {
  @ApiPropertyOptional({
    description: 'Sigesit Attendance Date',
    example: '2021-04-02',
  })
  @IsOptional()
  attendance_date?: Date;

  @ApiPropertyOptional({
    description: 'Employee NIK',
    example: '19100155',
  })
  @IsOptional()
  nik?: string;
}
