import { ApiProperty } from '@nestjs/swagger';

export class CreateVoucherAttachmentDTO {
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
}