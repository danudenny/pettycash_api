import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsISO8601 } from "class-validator";
import { CreateAccountCashboxItemsDTO } from "./create-account-cashbox-items.dto";

export class CreateAccountDailyClosingDTO {

  @ApiProperty({
    description: "Closing Date",
    example: "2021-01-27"
  })
  @IsISO8601({ strict: false })
  closingDate: Date;

  @ApiProperty({
    description: 'Closing Bank Amount',
    example: 2000000,
  })
  openingBankAmount: number

  @ApiProperty({
    description: 'Closing Bank Amount',
    example: 2000000,
  })
  closingBankAmount: number

  @ApiProperty({
    description: 'Closing Bank Amount',
    example: 2000000,
  })
  openingCashAmount: number

  @ApiProperty({
    description: 'Closing Bank Amount',
    example: 2000000,
  })
  closingCashAmount: number

  @ApiProperty({
    description: 'Account Cashbox Items',
    type: [CreateAccountCashboxItemsDTO],
  })
  @IsArray()
  accountCashboxItems: CreateAccountCashboxItemsDTO[]
}