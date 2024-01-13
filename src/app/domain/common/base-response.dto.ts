import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseResponse {
  @ApiProperty({ description: 'Status', example: 'success' })
  status: string = 'success';
}
