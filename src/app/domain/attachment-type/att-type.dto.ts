import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { AttachmentTypes } from "../../../model/utils/enum";

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

  @ApiProperty({
    description: 'Att Type',
    example: 'expense'
  })
  type: AttachmentTypes;
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

  @ApiProperty({
    description: 'Att Type',
    example: 'expense'
  })
  type: AttachmentTypes;
}


export class QueryAttachmentTypeDTO {
  @ApiPropertyOptional({
    description: 'Att Type',
    example: 'expense'
  })
  type?: AttachmentTypes;
}