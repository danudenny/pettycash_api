import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';

export class PingResponse extends BaseResponse {
  @ApiProperty({
    description: 'Timestamp',
    example: '1620314513304',
  })
  timestamp: number;
}
