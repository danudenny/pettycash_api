import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AttachmentTypeDTO {
  @ApiProperty({
    description: 'Att Type ID',
    example: ''
  })
  @IsUUID()
  id?: string;

  @ApiProperty({
    description: 'Att Type Code',
    example: 'ktp'
  })
  code: string;

  @ApiProperty({
    description: 'Att Type Name',
    example: 'KTP'
  })
  name: string;
}

export class CreateAttachmentTypeDTO {
  @ApiProperty({
    description: 'Att Type Code',
    example: 'ktp'
  })
  code: string;

  @ApiProperty({
    description: 'Att Type Name',
    example: 'KTP'
  })
  name: string;
}