import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BankBranchDTO {
  @ApiProperty({
    description: 'Bank Branch ID',
    example: 'eaaf465b-65bc-4784-909e-8d0180c6eb4c',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Bank Name',
    example: 'BCA',
  })
  bankName: string;

  @ApiProperty({
    description: 'Account Number',
    example: '770990011',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Account Holder Name',
    example: 'SiCepat Medan',
  })
  accountHolderName: string;
}
