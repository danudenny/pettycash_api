import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttachmentType } from '../../../model/utils/enum';

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

  @ApiPropertyOptional({
    description: 'Attachment type',
    example: AttachmentType.KTP
  })
  attachmentType?: AttachmentType;
}