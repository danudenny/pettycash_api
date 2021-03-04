import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseAttachmentDTO {
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
  attachements: any[];
}
