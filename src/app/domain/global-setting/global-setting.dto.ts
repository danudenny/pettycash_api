import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class GlobalSettingDTO {
  @ApiProperty({
    description: 'Voucher Partner ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  voucherPartnerId: string;

  @ApiProperty({
    description: 'Voucher Partner Name',
    example: 'HR Sicepat',
  })
  voucherPartnerName: string;

  @ApiProperty({
    description: 'Deviation Amount',
    example: 1000,
  })
  @IsNumber()
  deviationAmount: Number;

  @ApiProperty({
    description: 'Cash Transit CoA ID',
    example: '92f61acb-5789-4778-a2b9-5be7f704819e',
  })
  @IsUUID()
  cashTransitCoaId: string;

  @ApiProperty({
    description: 'Cash Transit CoA Code',
    example: '500.120.11',
  })
  cashTransitCoaCode: string;

  @ApiProperty({
    description: 'Down Payment Perdin CoA ID',
    example: 'fd48f445-f078-4791-b303-14baee6e33d1',
  })
  @IsUUID()
  downPaymentPerdinCoaId: string;

  @ApiProperty({
    description: 'Down Payment Perdin CoA Code',
    example: '600.111.20',
  })
  downPaymentPerdinCoaCode: string;

  @ApiProperty({
    description: 'Down Payment Reimbursement CoA ID',
    example: '231aa0da-ae36-4aa3-807c-f38faaeaf1ec',
  })
  @IsUUID()
  downPaymentReimbursementCoaId: string;

  @ApiProperty({
    description: 'Down Payment Reimbursement CoA Code',
    example: '600.111.40',
  })
  downPaymentReimbursementCoaCode: string;
}
