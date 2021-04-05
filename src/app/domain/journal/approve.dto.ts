import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class BatchPayloadJournalDataDTO {
  @ApiProperty({
    description: 'Journal ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;
}

export class BatchPayloadJournalDTO {
  @ApiProperty({
    description: 'Journal Datas',
    type: [BatchPayloadJournalDataDTO],
  })
  @IsArray()
  datas: BatchPayloadJournalDataDTO[];
}
