import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AccountCashboxItemsDTO {

  @ApiProperty({
    description: 'Account Cashbox Item ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: "Pieces (Denomination)",
    example: 100000
  })
  pieces: number;

  @ApiProperty({
    description: "Total (Number of cash)",
    example: 5
  })
  total: number;

  @ApiProperty({
    description: "Total Amount",
    example: 500000
  })
  totalAmount: number;
}