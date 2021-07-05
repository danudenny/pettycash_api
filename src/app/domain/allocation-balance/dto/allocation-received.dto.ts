import { ApiProperty } from "@nestjs/swagger";

export class ReceivedAllocationBalanceDTO {
  @ApiProperty({
    example: '2021-07-01',
  })
  receivedDate: Date
}