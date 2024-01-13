import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class BatchJournalIdDTO {
  @ApiProperty({
    description: 'Journal ID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;
}

export class BatchJournalDTO {
  @ApiProperty({
    description: 'Successfully Datas',
    type: [BatchJournalIdDTO],
  })
  @IsArray()
  success: BatchJournalIdDTO[];

  @ApiProperty({
    description: 'Failed Datas',
    type: [BatchJournalIdDTO],
  })
  @IsArray()
  fail: BatchJournalIdDTO[];
}
