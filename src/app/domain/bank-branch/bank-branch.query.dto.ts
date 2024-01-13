import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class QueryBankBranchDTO {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page Number',
  })
  @Transform((value) => value || 1)
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'The maximum number of results data to return.',
  })
  @Transform((value) => value || 10)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Search by Bank Name',
    example: 'BCA',
  })
  bankName__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Account Number',
    example: '770990011',
  })
  accountNumber__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Account Holder Name',
    example: 'SiCepat Medan',
  })
  accountHolderName__icontains: string;
}
