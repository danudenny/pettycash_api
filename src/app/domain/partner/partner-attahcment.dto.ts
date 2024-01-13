import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PartnerAttachmentDTO {
  @ApiProperty({
    description: 'Attachment ID',
    example: 'd659d65c-fcf3-45c8-956e-5baf9dee2522',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Name',
    example: 'image-name.jpg',
  })
  name: string;

  @ApiProperty({
    description: 'File Name',
    example: 'image-file-name.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'File Mime Type',
    example: 'image/jpeg',
  })
  fileMime: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://sicepatresi.s3.amazonaws.com/0009775/000977539725.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Attachment type'
  })
  typeId: string;

}