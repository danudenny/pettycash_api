import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

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
  attachments: any[];

  @ApiPropertyOptional({
    description: 'Attachment Type ID',
    example: '686fdea3-7017-44bc-bce4-223d828beb64',
  })
  @IsUUID()
  @IsOptional()
  typeId?: string;
}
