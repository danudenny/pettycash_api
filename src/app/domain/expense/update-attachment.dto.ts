import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseAttachmentDTO {
  @ApiPropertyOptional({
    description: 'Is Attachment Checked?',
    example: true,
  })
  isChecked?: boolean;
}
