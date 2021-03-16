import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class BatchApproveJournalDataDTO {
  @ApiProperty({
    description: 'Journal ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;
}

export class BatchApproveJournalDTO {
  @ApiProperty({
    description: 'Journal Datas',
    type: [BatchApproveJournalDataDTO],
  })
  @IsArray()
  datas: BatchApproveJournalDataDTO[];
}
