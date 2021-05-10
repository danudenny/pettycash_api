import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePartnerAttachmentDTO {
  @ApiProperty({
    required: true,
    description: 'Attachments',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  attachments: any[];

  @ApiProperty()
  @IsUUID()
  typeId: string;
}