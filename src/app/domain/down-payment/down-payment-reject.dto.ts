import { ApiProperty } from '@nestjs/swagger';

export class RejectDownPaymentDTO {
  @ApiProperty({ description: 'Rejected Note', example: 'Isi Description' })
  rejectedNote: string;
}
