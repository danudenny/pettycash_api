import { ApiProperty } from '@nestjs/swagger';

export class ExpenseItemAttributeDTO {
  @ApiProperty({
    description: 'Key',
    example: 'vehicleNumber',
  })
  key: string;

  @ApiProperty({
    description: 'Value',
    example: 'B-1234-VKG',
  })
  value: string;
}
